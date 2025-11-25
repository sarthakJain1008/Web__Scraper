// scrape-all-listings-details.js
// Batch scrape detailed data for all listings
// Uses 100 listing URLs per API call for efficient scraping

import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './database.js';

dotenv.config();

const BATCH_SIZE = 100; // URLs per API call
const DELAY_BETWEEN_CALLS = 2000; // 2 seconds between calls
const MAX_RETRIES = 3;

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Batch scrape listings with detailed data
 */
async function batchScrapeDetails() {
  console.log('🔍 BATCH DETAIL SCRAPER FOR ALL LISTINGS');
  console.log('━'.repeat(70));
  console.log('Strategy: 100 listing URLs per API call');
  console.log('━'.repeat(70));
  console.log('');

  const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
  const db = await connectDB();
  const collection = db.collection('listings');

  try {
    // Get all listing URLs
    console.log('📊 Fetching listing URLs from database...');
    const allListings = await collection
      .find({}, { projection: { url: 1, listing_id: 1 } })
      .toArray();

    console.log(`✅ Found ${allListings.length.toLocaleString()} listings`);
    console.log('');

    // Split into batches of 100
    const batches = [];
    for (let i = 0; i < allListings.length; i += BATCH_SIZE) {
      batches.push(allListings.slice(i, i + BATCH_SIZE));
    }

    console.log(`📦 Created ${batches.length.toLocaleString()} batches of ${BATCH_SIZE} URLs`);
    console.log('');

    // Cost estimation
    const estimatedCost = batches.length * 0.02; // ~$0.02 per API call
    const estimatedTime = (batches.length * (DELAY_BETWEEN_CALLS + 30000)) / 1000 / 60; // minutes

    console.log('💰 Cost Estimation:');
    console.log(`  - API calls: ${batches.length.toLocaleString()}`);
    console.log(`  - Cost per call: $0.02`);
    console.log(`  - Total estimated cost: $${estimatedCost.toFixed(2)}`);
    console.log('');
    console.log('⏱️  Time Estimation:');
    console.log(`  - Estimated time: ${estimatedTime.toFixed(0)} minutes (~${(estimatedTime / 60).toFixed(1)} hours)`);
    console.log('');

    // Ask for confirmation
    const testMode = process.env.TEST_MODE === 'true';
    const testLimit = parseInt(process.env.TEST_LIMIT || '10', 10);

    if (testMode) {
      console.log('🧪 TEST MODE: Processing only', testLimit, 'batches');
      batches.splice(testLimit);
    } else {
      console.log('⚠️  WARNING: This will process ALL', batches.length, 'batches!');
      console.log('   Set TEST_MODE=true TEST_LIMIT=10 to test first');
      console.log('');
    }

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

      console.log(`\n[Batch ${batchNum}/${batches.length}] Processing ${batch.length} URLs...`);

      let retries = 0;
      let success = false;

      while (retries < MAX_RETRIES && !success) {
        try {
          // Prepare URLs array
          const urls = batch.map(item => item.url);

          console.log(`  📤 Calling Apify actor with ${urls.length} URLs...`);

          // Call actor with listing URLs
          const run = await client.actor('jupri/etsy-scraper').call({
            query: urls.join('\n'), // Multiple URLs separated by newlines
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
                
                // Update timestamp
                detailsScrapedAt: new Date(),
                detailsScrapedBatch: batchNum
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

      // Progress update
      const progressPct = ((processedBatches / batches.length) * 100).toFixed(1);
      console.log(`  📊 Progress: ${processedBatches}/${batches.length} (${progressPct}%)`);
      console.log(`  ✅ Success: ${successCount} | ❌ Errors: ${errorCount} | 💾 Updated: ${updatedCount}`);

      // Delay between batches
      if (batchIndex < batches.length - 1) {
        console.log(`  ⏸️  Waiting ${DELAY_BETWEEN_CALLS / 1000}s before next batch...`);
        await sleep(DELAY_BETWEEN_CALLS);
      }
    }

    console.log('');
    console.log('━'.repeat(70));
    console.log('✅ BATCH SCRAPING COMPLETE!');
    console.log('━'.repeat(70));
    console.log('');
    console.log('📊 Final Statistics:');
    console.log(`  Total batches: ${batches.length}`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Failed: ${errorCount}`);
    console.log(`  Listings updated: ${updatedCount.toLocaleString()}`);
    console.log(`  Actual cost: ~$${(successCount * 0.02).toFixed(2)}`);
    console.log('');

    // Show sample of updated listings
    console.log('🔍 Sample updated listings:');
    const samples = await collection.find({ 
      detailsScrapedBatch: { $exists: true } 
    }).limit(3).toArray();

    samples.forEach((listing, idx) => {
      console.log(`\n${idx + 1}. ${listing.title?.substring(0, 60)}`);
      console.log(`   Tags (${listing.tags?.length || 0}):`, listing.tags?.slice(0, 5).join(', '));
      console.log(`   Materials (${listing.materials?.length || 0}):`, listing.materials?.join(', '));
      console.log(`   Batch: ${listing.detailsScrapedBatch}`);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  batchScrapeDetails()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { batchScrapeDetails };
