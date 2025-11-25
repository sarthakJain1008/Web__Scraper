// scrape-parallel-helper.js
// Helper script for API 10 to help with API 9's workload
// Based on scrape-parallel-details.js but with custom range support

import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './database.js';
import { API_KEYS } from './api-keys.config.js';

dotenv.config();

const BATCH_SIZE = 5; // URLs per API call
const DELAY_BETWEEN_CALLS = 2000; // 2 seconds between calls
const MAX_RETRIES = 3;
const API_INDEX = 9; // Using API 10 (index 9) with new key
const START_INDEX = 247103; // Mid-point of API 9's range
const END_INDEX = 261638;   // End of API 9's range

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parallel batch scrape for helper
 */
async function parallelBatchScrape() {
  const apiKeyIndex = API_INDEX;
  const apiKey = API_KEYS[apiKeyIndex];
  
  console.log('🔍 HELPER PARALLEL BATCH DETAIL SCRAPER');
  console.log('━'.repeat(70));
  console.log(`API Key Index: ${apiKeyIndex + 1}/${API_KEYS.length} (API 10 helping API 9)`);
  console.log(`Processing range: ${START_INDEX}-${END_INDEX}`);
  console.log(`Batch size: ${BATCH_SIZE} URLs per call`);
  console.log('━'.repeat(70));
  console.log('');

  const client = new ApifyClient({ token: apiKey });
  const db = await connectDB();
  const collection = db.collection('listings');

  try {
    // Get assigned listings in the custom range
    const query = {
      $and: [
        { detailsScrapedByApi: { $ne: apiKeyIndex } }, // Not processed by this API yet
        { detailsScrapedByApi: { $ne: 8 } }           // Not processed by API 9 yet
      ]
    };

    const allListings = await collection
      .find(query, { projection: { url: 1, listing_id: 1 } })
      .skip(START_INDEX)
      .limit(END_INDEX - START_INDEX)
      .toArray();

    console.log(`✅ Found ${allListings.length.toLocaleString()} listings to process in range ${START_INDEX}-${END_INDEX}`);
    console.log('');

    // Split into batches of 5
    const batches = [];
    for (let i = 0; i < allListings.length; i += BATCH_SIZE) {
      batches.push(allListings.slice(i, i + BATCH_SIZE));
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
                detailsScrapedApiOffset: START_INDEX + (batchIndex * BATCH_SIZE)
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
                    detailsScrapeBatchEmpty: true
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
    console.log(`✅ API 10 HELPER COMPLETE!`);
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

// Run script
parallelBatchScrape()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
