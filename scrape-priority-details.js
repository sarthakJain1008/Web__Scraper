// scrape-priority-details.js
// Scrape tags/materials for high-priority listings only
// Targets: Star sellers, bestsellers, high performers (~80-100K listings)

import { ApifyClient } from 'apify-client';
import { connectDB, closeDB } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 100;
const DELAY_MS = parseInt(process.env.DELAY_MS) || 2000; // 2 seconds between requests
const TEST_MODE = process.env.TEST_MODE === 'true';
const TEST_LIMIT = parseInt(process.env.TEST_LIMIT) || 10;

async function scrapeDetails() {
  console.log('🏷️  PRIORITY LISTINGS DETAIL SCRAPER\n');
  console.log('━'.repeat(60));
  console.log('Target: High-value listings without tags');
  console.log('Batch size:', BATCH_SIZE);
  console.log('Delay:', DELAY_MS, 'ms');
  console.log('Test mode:', TEST_MODE ? `YES (${TEST_LIMIT} listings)` : 'NO');
  console.log('━'.repeat(60) + '\n');
  
  const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
  
  if (!process.env.APIFY_API_TOKEN) {
    throw new Error('APIFY_API_TOKEN is required');
  }
  
  try {
    const db = await connectDB();
    const collection = db.collection('listings');
    
    // Count total priority listings without tags
    const totalQuery = {
      tags: { $exists: false },
      $or: [
        { isStarSeller: true },
        { is_bestseller: true },
        { performanceTag: 'high' },
        { shop_total_rating_count: { $gte: 500 } },
        { in_cart_count: { $gte: 30 } }
      ]
    };
    
    const total = await collection.countDocuments(totalQuery);
    console.log(`📊 Total priority listings without tags: ${total.toLocaleString()}`);
    console.log(`💰 Estimated cost: $${(total * 0.001).toFixed(2)}`);
    console.log(`⏱️  Estimated time: ${Math.ceil(total * (DELAY_MS / 1000) / 3600)} hours\n`);
    
    if (TEST_MODE) {
      console.log(`🧪 TEST MODE: Processing only ${TEST_LIMIT} listings\n`);
    }
    
    // Get batch of listings to process
    const limit = TEST_MODE ? TEST_LIMIT : BATCH_SIZE;
    const listings = await collection
      .find(totalQuery)
      .limit(limit)
      .toArray();
    
    if (listings.length === 0) {
      console.log('✅ All priority listings already have tags!');
      return;
    }
    
    console.log(`📋 Processing batch: ${listings.length} listings\n`);
    
    let processed = 0;
    let withTags = 0;
    let withoutTags = 0;
    let errors = 0;
    
    const startTime = Date.now();
    
    for (const listing of listings) {
      const listingNum = processed + 1;
      const titlePreview = listing.title?.substring(0, 60) || 'Untitled';
      
      try {
        console.log(`\n[${listingNum}/${listings.length}] ${titlePreview}...`);
        console.log(`  URL: ${listing.url}`);
        console.log(`  Shop: ${listing.shop_name} (⭐${listing.shop_average_rating}, ${listing.shop_total_rating_count} reviews)`);
        
        // Scrape individual listing URL for details
        const run = await client.actor('jupri/etsy-scraper').call({
          query: listing.url,
          limit: 1
        }, { waitSecs: 0 });
        
        await client.run(run.id).waitForFinish();
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        if (items.length > 0) {
          const response = items[0];
          
          // Tags are in response.listing.tags, not response.tags
          const listingData = response.listing || {};
          const tags = listingData.tags || [];
          const materials = listingData.materials || [];
          const category_tags = listingData.category_tags || [];
          
          if (tags.length > 0 || materials.length > 0) {
            // Update database with tags and materials
            await collection.updateOne(
              { url: listing.url },
              { 
                $set: {
                  tags: tags,
                  materials: materials,
                  category_tags: category_tags,
                  detailsScrapedAt: new Date()
                }
              }
            );
            
            withTags++;
            console.log(`  ✅ Updated!`);
            console.log(`     Tags: ${tags.length} → ${JSON.stringify(tags.slice(0, 3))}${tags.length > 3 ? '...' : ''}`);
            console.log(`     Materials: ${materials.length} → ${JSON.stringify(materials)}`);
          } else {
            withoutTags++;
            console.log(`  ⚠️  No tags/materials found in response`);
            
            // Mark as processed anyway
            await collection.updateOne(
              { url: listing.url },
              { 
                $set: {
                  tags: [],
                  materials: [],
                  detailsScrapedAt: new Date(),
                  noTagsAvailable: true
                }
              }
            );
          }
        } else {
          withoutTags++;
          console.log(`  ⚠️  No data returned from actor`);
        }
        
        processed++;
        
        // Progress update every 10 items
        if (processed % 10 === 0) {
          const elapsed = (Date.now() - startTime) / 1000;
          const rate = processed / elapsed;
          const remaining = limit - processed;
          const eta = remaining / rate / 60;
          
          console.log(`\n📈 Progress: ${processed}/${limit} (${((processed/limit)*100).toFixed(1)}%)`);
          console.log(`   Success: ${withTags}, No tags: ${withoutTags}, Errors: ${errors}`);
          console.log(`   Rate: ${rate.toFixed(2)} listings/sec`);
          console.log(`   ETA: ${eta.toFixed(1)} minutes\n`);
        }
        
        // Rate limit delay
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        
      } catch (error) {
        errors++;
        console.error(`  ❌ Error: ${error.message}`);
        
        // Mark as error in database
        await collection.updateOne(
          { url: listing.url },
          { 
            $set: {
              detailsScrapeError: error.message,
              detailsScrapedAt: new Date()
            }
          }
        );
      }
    }
    
    const duration = (Date.now() - startTime) / 1000;
    
    console.log('\n' + '━'.repeat(60));
    console.log('📊 BATCH COMPLETE');
    console.log('━'.repeat(60));
    console.log(`Processed: ${processed} listings`);
    console.log(`✅ With tags: ${withTags} (${((withTags/processed)*100).toFixed(1)}%)`);
    console.log(`⚠️  Without tags: ${withoutTags}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`);
    console.log(`💰 Cost: $${(processed * 0.001).toFixed(3)}`);
    
    // Check remaining
    const remaining = await collection.countDocuments(totalQuery);
    console.log(`\n📋 Remaining priority listings: ${remaining.toLocaleString()}`);
    
    if (remaining > 0) {
      console.log(`\n🔄 To continue, run: node scrape-priority-details.js`);
    } else {
      console.log(`\n✨ All priority listings now have tags!`);
    }
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

// Run
scrapeDetails().catch(console.error);
