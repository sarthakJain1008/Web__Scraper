// scrape-parallel-optimized.js
// Optimized parallel scraper - divides only REMAINING listings among 10 APIs
// No duplicate work, efficient distribution

import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './database.js';
import { API_KEYS } from './api-keys.config.js';

dotenv.config();

const BATCH_SIZE = 5; // URLs per API call
const DELAY_BETWEEN_CALLS = 2000; // 2 seconds between calls
const MAX_RETRIES = 3;
const NUM_WORKERS = parseInt(process.env.NUM_WORKERS || '1', 10); // Get number of active workers

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get API key index from command line or env
 */
function getApiKeyIndex() {
  const index = parseInt(process.env.API_KEY_INDEX || process.argv[2] || '0', 10);
  
  if (index < 0 || index >= API_KEYS.length) {
    throw new Error(`Invalid API_KEY_INDEX: ${index}. Must be 0-${API_KEYS.length - 1}`);
  }
  
  return index;
}

/**
 * Optimized parallel batch scrape - only unprocessed listings
 */
async function optimizedParallelScrape() {
  const apiKeyIndex = getApiKeyIndex();
  const apiKey = API_KEYS[apiKeyIndex];
  
  console.log('🔍 OPTIMIZED PARALLEL DETAIL SCRAPER');
  console.log('━'.repeat(70));
  console.log(`API Key Index: ${apiKeyIndex + 1}/${API_KEYS.length}`);
  console.log(`Batch size: ${BATCH_SIZE} URLs per call`);
  console.log('Strategy: Divide only REMAINING unprocessed listings');
  console.log('━'.repeat(70));
  console.log('');

  const client = new ApifyClient({ token: apiKey });
  const db = await connectDB();
  const collection = db.collection('listings');

  try {
    // Get total counts
    const totalListings = await collection.countDocuments({});
    const alreadyProcessed = await collection.countDocuments({
      detailsScrapedByApi: { $exists: true }
    });
    const unprocessedCount = totalListings - alreadyProcessed;
    
    console.log('📊 Database Status:');
    console.log(`  Total listings: ${totalListings.toLocaleString()}`);
    console.log(`  Already processed: ${alreadyProcessed.toLocaleString()}`);
    console.log(`  Remaining: ${unprocessedCount.toLocaleString()}`);
    console.log('');

    // Get all unprocessed listings
    const unprocessedListings = await collection
      .find(
        { detailsScrapedByApi: { $exists: false } },
        { projection: { url: 1, listing_id: 1 } }
      )
      .toArray();

    console.log(`✅ Fetched ${unprocessedListings.length.toLocaleString()} unprocessed listings`);
    console.log('');

    // Divide unprocessed listings among the active workers
    const listingsPerWorker = Math.ceil(unprocessedListings.length / NUM_WORKERS);
    const workerIndex = parseInt(process.env.WORKER_ID || '0', 10); // A unique ID for each worker process
    const startIndex = workerIndex * listingsPerWorker;
    const endIndex = Math.min(startIndex + listingsPerWorker, unprocessedListings.length);
    
    // Get this API's assigned chunk
    const myListings = unprocessedListings.slice(startIndex, endIndex);

    console.log('📊 Assignment for this API:');
    console.log(`  Total unprocessed: ${unprocessedListings.length.toLocaleString()}`);
    console.log(`  Per Worker: ${listingsPerWorker.toLocaleString()}`);
    console.log(`  My range: ${startIndex.toLocaleString()} - ${endIndex.toLocaleString()}`);
    console.log(`  My count: ${myListings.length.toLocaleString()} listings`);
    console.log('');

    if (myListings.length === 0) {
      console.log('✅ No listings assigned to this API (all work done by others)');
      return;
    }

    // Split into batches of 5
    const batches = [];
    for (let i = 0; i < myListings.length; i += BATCH_SIZE) {
      batches.push(myListings.slice(i, i + BATCH_SIZE));
    }

    console.log(`📦 Created ${batches.length.toLocaleString()} batches of ${BATCH_SIZE} URLs`);
    console.log('');

    // Cost estimation
    const estimatedCost = batches.length * 0.02;
    const estimatedTime = (batches.length * (DELAY_BETWEEN_CALLS + 30000)) / 1000 / 60;

    console.log('💰 Cost Estimation:');
    console.log(`  - API calls: ${batches.length.toLocaleString()}`);
    console.log(`  - Cost per call: $0.02`);
    console.log(`  - Total estimated cost: $${estimatedCost.toFixed(2)}`);
    console.log('');
    console.log('⏱️  Time Estimation:');
    console.log(`  - Estimated time: ${estimatedTime.toFixed(0)} minutes (~${(estimatedTime / 60).toFixed(1)} hours)`);
    console.log('');

    let processedBatches = 0;
    let successCount = 0;
    let errorCount = 0;
    let updatedCount = 0;

    console.log('🚀 Starting batch processing...');
    console.log('━'.repeat(70));
    console.log('');

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchNum = batchIndex + 1;

      console.log(`\n[API ${apiKeyIndex + 1}] [Batch ${batchNum}/${batches.length}] Processing ${batch.length} URLs...`);

      let retries = 0;
      let success = false;

      while (retries < MAX_RETRIES && !success) {
        try {
          // Prepare URLs array
          const urls = batch.map(item => item.url);

          console.log(`  📤 Calling Apify actor with ${urls.length} URLs...`);

          // Call actor with listing URLs
          const run = await client.actor('jupri/etsy-scraper').call({
            query: urls.join('\n'),
            limit: urls.length
          }, { waitSecs: 0 });

          console.log(`  ⏳ Waiting for run ${run.id} to complete...`);
          await client.run(run.id).waitForFinish();

          // Get results
          const { items } = await client.dataset(run.defaultDatasetId).listItems();
          console.log(`  ✅ Received ${items.length} items`);

          // Process results
          if (items.length > 0) {
            for (const item of items) {
              // Extract detailed data from response
              const listingData = item.listing || item;
              
              if (!listingData.listing_id) {
                console.log(`  ⚠️  Skipping item without listing_id`);
                continue;
              }

              // Prepare update with all detailed fields
              const updateData = {
                // Tags and materials
                tags: listingData.tags || [],
                materials: listingData.materials || [],
                category_tags: listingData.category_tags || [],
                
                // Description and details
                description: listingData.description || null,
                who_made: listingData.who_made || null,
                when_made: listingData.when_made || null,
                
                // Additional flags
                has_star_seller_signal: listingData.has_star_seller_signal || false,
                is_bestseller: listingData.is_bestseller || false,
                is_bestseller_by_fixed_qty_category_l3: listingData.is_bestseller_by_fixed_qty_category_l3 || false,
                is_bestseller_by_fixed_qty_category_leaf: listingData.is_bestseller_by_fixed_qty_category_leaf || false,
                is_made_to_order: listingData.is_made_to_order || false,
                is_top_rated: listingData.is_top_rated || false,
                
                // Shipping info
                free_shipping_countries: listingData.free_shipping_countries || [],
                free_shipping_data: listingData.free_shipping_data || null,
                
                // Item details
                item_details: listingData.item_details || [],
                
                // Tracking fields
                detailsScrapedAt: new Date(),
                detailsScrapedBatch: batchNum,
                detailsScrapedByApi: apiKeyIndex, // Track which API processed this
                optimizedScraper: true // Mark as optimized scraper
              };

              // Update database
              const result = await collection.updateOne(
                { listing_id: listingData.listing_id },
                { $set: updateData }
              );

              if (result.modifiedCount > 0) {
                updatedCount++;
              }
            }

            console.log(`  💾 Updated ${items.length} listings in database`);
          } else {
            console.log(`  ⚠️  No items returned for this batch`);
            
            // Still mark as processed to avoid retrying
            for (const listing of batch) {
              await collection.updateOne(
                { listing_id: listing.listing_id },
                { 
                  $set: { 
                    detailsScrapedByApi: apiKeyIndex,
                    detailsScrapedAt: new Date(),
                    detailsScrapeBatchEmpty: true,
                    optimizedScraper: true
                  } 
                }
              );
            }
          }

          successCount++;
          success = true;

        } catch (error) {
          retries++;
          console.error(`  ❌ Error (attempt ${retries}/${MAX_RETRIES}):`, error.message);

          if (retries < MAX_RETRIES) {
            console.log(`  🔄 Retrying in 5 seconds...`);
            await sleep(5000);
          } else {
            console.error(`  ❌ Failed after ${MAX_RETRIES} retries, skipping batch`);
            errorCount++;
          }
        }
      }

      processedBatches++;

      // Progress update every 10 batches
      if (batchNum % 10 === 0 || batchNum === batches.length) {
        const progressPct = ((processedBatches / batches.length) * 100).toFixed(1);
        console.log(`\n  📊 Progress: ${processedBatches}/${batches.length} (${progressPct}%)`);
        console.log(`  ✅ Success: ${successCount} | ❌ Errors: ${errorCount} | 💾 Updated: ${updatedCount}`);
        console.log(`  💰 Cost so far: $${(successCount * 0.02).toFixed(2)}`);
      }

      // Delay between batches
      if (batchIndex < batches.length - 1) {
        await sleep(DELAY_BETWEEN_CALLS);
      }
    }

    console.log('');
    console.log('━'.repeat(70));
    console.log(`✅ API ${apiKeyIndex + 1} COMPLETE!`);
    console.log('━'.repeat(70));
    console.log('');
    console.log('📊 Final Statistics:');
    console.log(`  Total batches: ${batches.length}`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Failed: ${errorCount}`);
    console.log(`  Listings updated: ${updatedCount.toLocaleString()}`);
    console.log(`  Actual cost: ~$${(successCount * 0.02).toFixed(2)}`);
    console.log('');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizedParallelScrape()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { optimizedParallelScrape };
