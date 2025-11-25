// index.js
// Etsy Scraper using Apify API with CSV categories
// Reads categories from CSV file, scrapes 100 listings per category
// Stores results in MongoDB

import { ApifyClient } from 'apify-client';
import { parse } from 'csv-parse/sync';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { connectDB, closeDB, insertListings, getStats } from './database.js';

dotenv.config();

/**
 * Read categories from CSV file
 * Handles CSV with URLs in first column (no header)
 */
async function readCategoriesFromCSV(filePath) {
  console.log(`📖 Reading categories from ${filePath}...`);
  
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse CSV without headers (raw rows)
    const records = parse(fileContent, {
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true
    });

    // Extract URLs from first column
    const categories = records
      .map(row => row[0]) // First column contains URLs
      .filter(val => val && val.trim() && val.startsWith('http'))
      .map(url => url.trim());

    console.log(`✅ Found ${categories.length} category URLs in CSV\n`);
    
    if (categories.length > 0) {
      console.log(`📋 Sample categories:`);
      categories.slice(0, 3).forEach((cat, idx) => {
        console.log(`   ${idx + 1}. ${cat}`);
      });
      console.log();
    }
    
    return categories;
    
  } catch (error) {
    console.error(`❌ Error reading CSV:`, error.message);
    throw error;
  }
}

/**
 * Split categories into N chunks for concurrent processing
 */
function splitIntoChunks(array, numChunks) {
  const chunks = Array.from({ length: numChunks }, () => []);
  array.forEach((item, index) => {
    chunks[index % numChunks].push(item);
  });
  return chunks;
}

/**
 * Scrape Etsy listings with balanced sampling for embedding analysis
 * Target: 300 per country with sort diversity, star sellers, and Etsy's picks
 */
async function scrapeEtsyCategory(apifyClient, categoryUrl, listingsPerCountry = 300) {
  const startTime = Date.now();
  
  // Extract category name from URL for logging
  const categoryName = categoryUrl.split('/').pop() || categoryUrl;
  const searchTerm = categoryName.replace(/-/g, ' ');
  
  // Countries to scrape from
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' }
  ];
  
  // Cost-efficient distribution: 4 API calls per country, max items per call
  // Apify pricing: 0.001$ per call for 20-100 items, so maximize to 100+ per call
  const targets = {
    relevance: Math.floor(listingsPerCountry * 0.45),      // 135 - Relevance (1 call)
    mostRecent: Math.floor(listingsPerCountry * 0.25),     // 75 - Most Recent (1 call)
    highPrice: Math.floor(listingsPerCountry * 0.15),      // 45 - Highest Price (1 call)
    lowPrice: Math.floor(listingsPerCountry * 0.15)        // 45 - Lowest Price (1 call)
  };
  
  const perShopCap = 10; // Max listings per shop to avoid dominance
  
  console.log(`[${categoryName}] 🔍 Multi-country scrape (${listingsPerCountry} per country × ${countries.length} = ${listingsPerCountry * countries.length} total)`);
  console.log(`[${categoryName}] 📊 Targets: Relevance=${targets.relevance}, Recent=${targets.mostRecent}, High$=${targets.highPrice}, Low$=${targets.lowPrice}`);
  console.log(`[${categoryName}] 💰 Cost: 4 API calls/country × ${countries.length} countries = ${4 * countries.length} calls @ $0.001 = $${(4 * countries.length * 0.001).toFixed(3)}`);
  console.log(`[${categoryName}] 🏪 PerShopCap=${perShopCap}\n`);
  
  let allListings = [];
  let successCount = 0;
  let errorCount = 0;
  
  try {
    // Scrape from each country
    for (const country of countries) {
      console.log(`[${categoryName}] 🌍 ${country.name} (${country.code})...`);
      
      try {
        const countryListings = [];
        
        // Cost-efficient approach: 4 API calls with max items per call (100+ each)
        
        // 1. Relevance sort (45% = 135) - Maximize per call
        const relevanceItems = await fetchBatch(apifyClient, {
          query: searchTerm,
          region: country.code,
          sort: 'score',
          limit: Math.max(targets.relevance + 30, 120), // At least 120 to maximize cost efficiency
          'filters.location': country.code
        }, `${categoryName}/${country.code}/Relevance`);
        countryListings.push(...relevanceItems.map((item, index) => ({ 
          ...item, 
          scrapedFacet: 'relevance',
          searchRank: index + 1,  // Position in search results (1-based)
          searchPage: Math.floor(index / 48) + 1  // Etsy shows ~48 items per page
        })));
        
        // 2. Most Recent (25% = 75)
        const recentItems = await fetchBatch(apifyClient, {
          query: searchTerm,
          region: country.code,
          sort: 'created',
          limit: Math.max(targets.mostRecent + 25, 100),
          'filters.location': country.code
        }, `${categoryName}/${country.code}/Recent`);
        countryListings.push(...recentItems.map((item, index) => ({ 
          ...item, 
          scrapedFacet: 'most_recent',
          searchRank: index + 1,
          searchPage: Math.floor(index / 48) + 1
        })));
        
        // 3. Highest Price (15% = 45) - DEBUG: Check what comes back
        const highPriceItems = await fetchBatch(apifyClient, {
          query: searchTerm,
          region: country.code,
          sort: 'price_high',
          limit: Math.max(targets.highPrice + 55, 100), // Request 100 to maximize
          'filters.location': country.code
        }, `${categoryName}/${country.code}/HighPrice`, true); // Debug flag
        countryListings.push(...highPriceItems.map((item, index) => ({ 
          ...item, 
          scrapedFacet: 'high_price',
          searchRank: index + 1,
          searchPage: Math.floor(index / 48) + 1
        })));
        
        // 4. Lowest Price (15% = 45) - DEBUG: Check what comes back
        const lowPriceItems = await fetchBatch(apifyClient, {
          query: searchTerm,
          region: country.code,
          sort: 'price_low',
          limit: Math.max(targets.lowPrice + 55, 100), // Request 100 to maximize
          'filters.location': country.code
        }, `${categoryName}/${country.code}/LowPrice`, true); // Debug flag
        countryListings.push(...lowPriceItems.map((item, index) => ({ 
          ...item, 
          scrapedFacet: 'low_price',
          searchRank: index + 1,
          searchPage: Math.floor(index / 48) + 1
        })));
        
        // Deduplicate by URL and enforce per-shop cap
        const dedupedListings = deduplicateAndCapShops(countryListings, perShopCap);
        
        // Can exceed 300 per country if we got good data
        const finalItems = dedupedListings;
        
        // Tag all with metadata
        const taggedItems = finalItems.map(item => ({
          ...item,
          scrapedCountry: country.code,
          scrapedCountryName: country.name,
          scrapedCategory: categoryUrl,
          scrapedCategoryName: categoryName,
          scrapedSearchTerm: searchTerm,
          // Correct field mappings from actor
          isStarSeller: item.has_star_seller_signal || item.fetchedAsStarSeller || false,
          isEtsyPick: item.is_in_merch_library || item.fetchedAsEtsyPick || false,
          priceRange: categorizePriceRange(item.price || item.listing_price),
          performanceTag: categorizePerformance(item)
        }));
        
        allListings.push(...taggedItems);
        
        // Report distribution
        const stats = calculateDistribution(taggedItems, targets);
        console.log(`[${categoryName}] ✅ ${country.code}: ${taggedItems.length} listings (target ${listingsPerCountry})`);
        console.log(`[${categoryName}]    📊 Rel=${stats.relevance}/${targets.relevance}, Rec=${stats.recent}/${targets.mostRecent}, Hi$=${stats.highPrice}/${targets.highPrice}, Lo$=${stats.lowPrice}/${targets.lowPrice}`);
        console.log(`[${categoryName}]    ⭐ StarSellers=${stats.starSeller}, TopRated=${stats.topRated}, ShopCap enforced\n`);
        
        successCount++;
        
      } catch (error) {
        console.error(`[${categoryName}] ❌ ${country.code} failed: ${error.message}`);
        errorCount++;
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[${categoryName}] 🎉 Completed: ${allListings.length} total listings from ${successCount}/${countries.length} countries in ${duration}s`);
    
    return {
      subcategory: categoryUrl,
      listings: allListings,
      success: true,
      duration,
      count: allListings.length,
      countriesScraped: successCount,
      countriesFailed: errorCount
    };
    
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`[${categoryName}] ❌ Fatal error: ${error.message}`);
    
    return {
      subcategory: categoryUrl,
      listings: allListings,
      success: false,
      duration,
      count: allListings.length,
      error: error.message
    };
  }
}

/**
 * Fetch a batch from Apify actor
 */
async function fetchBatch(apifyClient, input, label, debug = false) {
  try {
    if (debug) {
      console.log(`   🔍 ${label} INPUT:`, JSON.stringify(input, null, 2));
    }
    
    const run = await apifyClient.actor('jupri/etsy-scraper').call(input, { waitSecs: 0 });
    await apifyClient.run(run.id).waitForFinish();
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    console.log(`   ✓ ${label}: ${items.length} items (requested ${input.limit})`);
    
    if (debug && items.length > 0) {
      const prices = items.map(i => i.price).filter(p => p);
      console.log(`      Price range: $${Math.min(...prices)} - $${Math.max(...prices)}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limit
    return items;
  } catch (error) {
    console.error(`   ✗ ${label}: ${error.message}`);
    return [];
  }
}

/**
 * Deduplicate by URL and enforce per-shop cap
 */
function deduplicateAndCapShops(listings, perShopCap) {
  const seen = new Set();
  const shopCounts = {};
  const deduped = [];
  
  for (const item of listings) {
    const url = item.url || item.listing_url;
    const shopId = item.shop_id || item.shopId || item.shop_name || 'unknown';
    
    if (!url || seen.has(url)) continue;
    
    shopCounts[shopId] = (shopCounts[shopId] || 0) + 1;
    if (shopCounts[shopId] > perShopCap) continue;
    
    seen.add(url);
    deduped.push(item);
  }
  
  return deduped;
}

/**
 * Select top items by review quality for "Top Customer Reviews" facet
 */
function selectTopReviews(listings, targetCount) {
  const scored = listings.map(item => {
    const reviews = item.numReviews || item.reviewCount || item.num_reviews || 0;
    const rating = item.rating || item.averageRating || item.average_rating || 0;
    const score = reviews * rating; // Quality score
    return { item, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, targetCount).map(s => s.item);
}

/**
 * Calculate achieved distribution vs targets
 */
function calculateDistribution(listings, targets) {
  const counts = {
    starSeller: listings.filter(l => l.isStarSeller || l.has_star_seller_signal).length,
    topRated: listings.filter(l => l.is_top_rated).length,
    relevance: listings.filter(l => l.scrapedFacet === 'relevance').length,
    recent: listings.filter(l => l.scrapedFacet === 'most_recent').length,
    highPrice: listings.filter(l => l.scrapedFacet === 'high_price').length,
    lowPrice: listings.filter(l => l.scrapedFacet === 'low_price').length
  };
  return counts;
}

/**
 * Categorize price into ranges for analysis
 */
function categorizePriceRange(price) {
  if (!price || price === 0) return 'unknown';
  if (price < 10) return 'budget';
  if (price < 50) return 'low';
  if (price < 100) return 'medium';
  if (price < 500) return 'high';
  return 'premium';
}
/**
 * Categorize performance based on reviews, favorites, etc.
 */
function categorizePerformance(item) {
  // Actor returns shop-level rating, not listing-level
  const shopRating = item.shop_average_rating || 0;
  const shopReviews = item.shop_total_rating_count || 0;
  const isStarSeller = item.has_star_seller_signal || false;
  const isTopRated = item.is_top_rated || false;
  
  // High performing: Star seller or top rated with good shop metrics
  if (isStarSeller || (isTopRated && shopRating >= 4.8 && shopReviews > 100)) return 'high';
  
  // Medium performing: Decent shop rating
  if (shopRating >= 4.5 && shopReviews > 20) return 'medium';
  
  // Low performing: New or lower rated shops
  if (shopReviews < 10 || shopRating < 4.5) return 'low';
  
  return 'medium';
}

/**
 * Process a chunk of categories (worker function)
 */
async function processChunk(apifyClient, categories, workerId, maxListings) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 WORKER ${workerId}: Processing ${categories.length} categories`);
  console.log('='.repeat(60) + '\n');
  
  const startTime = Date.now();
  
  try {
    if (categories.length === 0) {
      return {
        workerId,
        categoryCount: 0,
        totalListings: 0,
        success: false,
        error: 'No categories assigned'
      };
    }

    // Scrape each category sequentially (to avoid rate limits)
    const results = [];
    for (const category of categories) {
      const result = await scrapeEtsyCategory(apifyClient, category, maxListings);
      results.push(result);
      
      // Store in MongoDB
      if (result.listings.length > 0) {
        const dbResult = await insertListings(result.subcategory, result.listings);
        const categoryName = category.split('/').pop();
        console.log(`[${categoryName}] 💾 Stored in DB: ${dbResult.inserted} new, ${dbResult.updated} updated (${result.countriesScraped}/${5} countries)`);
      }
      
      // Small delay between categories
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    const totalListings = results.reduce((sum, r) => sum + r.count, 0);
    const successCount = results.filter(r => r.success).length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n[WORKER ${workerId}] ✅ Completed: ${successCount}/${categories.length} categories, ${totalListings} total listings in ${duration}s\n`);
    
    return {
      workerId,
      categoryCount: categories.length,
      totalListings,
      successCount,
      duration,
      success: true
    };
    
  } catch (error) {
    console.error(`[WORKER ${workerId}] ❌ Fatal error:`, error.message);
    return {
      workerId,
      categoryCount: 0,
      totalListings: 0,
      success: false,
      error: error.message
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🛍️  ETSY SCRAPER - Multi-Country Analysis Edition\n');
  console.log('📊 Target: 1,500 listings per category (300 per country × 5 countries)');
  console.log('🌍 Countries: US, UK, Germany, Australia, Canada');
  console.log('🎯 Total Goal: ~502,500 listings (335 categories × 1,500)\n');
  
  const apifyToken = process.env.APIFY_API_TOKEN;
  const csvFilePath = process.env.CSV_FILE_PATH || './categories.csv';
  const numWorkers = parseInt(process.env.NUM_WORKERS) || 5;
  const listingsPerCountry = parseInt(process.env.LISTINGS_PER_COUNTRY) || 300;
  const testMode = process.env.TEST_MODE === 'true';
  const testCategories = parseInt(process.env.TEST_CATEGORIES) || 2;
  
  if (!apifyToken) {
    throw new Error('APIFY_API_TOKEN environment variable is required');
  }

  try {
    // Initialize clients
    const apifyClient = new ApifyClient({ token: apifyToken });
    await connectDB();
    
    console.log('✅ All clients initialized\n');

    // Read categories from CSV
    let allCategories = await readCategoriesFromCSV(csvFilePath);
    
    if (allCategories.length === 0) {
      throw new Error('No categories found in CSV file');
    }

    // Test mode: limit to first N categories
    if (testMode) {
      console.log(`🧪 TEST MODE: Using only first ${testCategories} categories\n`);
      allCategories = allCategories.slice(0, testCategories);
    }

    // Split categories into chunks for concurrent processing
    const categoryChunks = splitIntoChunks(allCategories, numWorkers);
    
    console.log(`📊 Total categories: ${allCategories.length}`);
    console.log(`👷 Concurrent workers: ${numWorkers}`);
    console.log(`📦 ${listingsPerCountry} listings per country × 5 countries = ${listingsPerCountry * 5} per category`);
    console.log(`📋 Categories per worker: ${categoryChunks.map(c => c.length).join(', ')}`);
    console.log(`⏱️  Estimated time: ${Math.ceil(allCategories.length * 10 / numWorkers / 60)} hours\n`);
    
    const startTime = Date.now();

    // Process all chunks concurrently
    const results = await Promise.all(
      categoryChunks.map((chunk, index) => 
        processChunk(apifyClient, chunk, index + 1, listingsPerCountry)
      )
    );

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 FINAL SUMMARY');
    console.log('='.repeat(60));
    
    let totalListings = 0;
    let totalCategories = 0;
    let successCount = 0;
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} Worker ${result.workerId}: ${result.categoryCount} categories, ${result.totalListings} listings (${result.duration}s)`);
      
      if (result.success) {
        totalListings += result.totalListings;
        totalCategories += result.categoryCount;
        successCount++;
      } else {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('='.repeat(60));
    console.log(`Total categories processed: ${totalCategories}`);
    console.log(`Total listings scraped: ${totalListings}`);
    console.log(`Successful workers: ${successCount}/${numWorkers}`);
    console.log(`Total execution time: ${totalDuration}s`);
    console.log('='.repeat(60));
    
    // Database statistics
    console.log('\n📊 DATABASE STATISTICS:');
    const stats = await getStats();
    console.log(`Total unique listings in DB: ${stats.totalListings}`);
    console.log(`\nTop 10 categories by listing count:`);
    stats.bySubcategory.slice(0, 10).forEach(item => {
      console.log(`  - ${item.subcategory}: ${item.count} listings`);
    });
    
    console.log('\n✨ Scraping complete! Data stored in MongoDB.');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await closeDB();
  }
}

// Run the main function
main().catch(console.error);
