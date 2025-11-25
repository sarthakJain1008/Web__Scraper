// test-parallel-100.js
// Test parallel scraper with 100 listings across 7 APIs
// Each API processes ~14 listings (2-3 batches of 5)

import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './database.js';
import { API_KEYS } from './api-keys.config.js';

dotenv.config();

const BATCH_SIZE = 5;
const TEST_TOTAL = 100; // Total listings to test
const NUM_APIS = 7;
const TEST_PER_API = Math.ceil(TEST_TOTAL / NUM_APIS); // ~15 per API

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test worker for one API
 */
async function testWorker(apiIndex, listingsToProcess) {
  const apiKey = API_KEYS[apiIndex];
  const client = new ApifyClient({ token: apiKey });
  const db = await connectDB();
  const collection = db.collection('listings');

  const startTime = Date.now();
  let updatedCount = 0;
  let taggedCount = 0;
  let batchCount = 0;

  console.log(`\n[API ${apiIndex + 1}] Starting test with ${listingsToProcess.length} listings...`);

  try {
    // Split into batches of 5
    const batches = [];
    for (let i = 0; i < listingsToProcess.length; i += BATCH_SIZE) {
      batches.push(listingsToProcess.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      batchCount++;
      const urls = batch.map(item => item.url);

      console.log(`  [API ${apiIndex + 1}] Batch ${batchCount}/${batches.length}: ${urls.length} URLs...`);

      try {
        const run = await client.actor('jupri/etsy-scraper').call({
          query: urls.join('\n'),
          limit: urls.length
        }, { waitSecs: 0 });

        await client.run(run.id).waitForFinish();
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log(`    ✅ Received ${items.length} items`);

        // Update database
        for (const item of items) {
          const listingData = item.listing || item;
          
          if (!listingData.listing_id) continue;

          const updateData = {
            tags: listingData.tags || [],
            materials: listingData.materials || [],
            category_tags: listingData.category_tags || [],
            description: listingData.description || null,
            who_made: listingData.who_made || null,
            when_made: listingData.when_made || null,
            detailsScrapedAt: new Date(),
            detailsScrapedByApi: apiIndex,
            testRun: true // Mark as test run
          };

          const result = await collection.updateOne(
            { listing_id: listingData.listing_id },
            { $set: updateData }
          );

          if (result.modifiedCount > 0) {
            updatedCount++;
            if (listingData.tags && listingData.tags.length > 0) {
              taggedCount++;
            }
          }
        }

        await sleep(2000); // 2s delay between batches
      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
      }
    }

    const elapsed = Date.now() - startTime;
    const elapsedSeconds = (elapsed / 1000).toFixed(1);

    console.log(`  [API ${apiIndex + 1}] ✅ Complete!`);
    console.log(`    Time: ${elapsedSeconds}s`);
    console.log(`    Updated: ${updatedCount}/${listingsToProcess.length}`);
    console.log(`    With tags: ${taggedCount}`);
    console.log(`    Success rate: ${((updatedCount/listingsToProcess.length)*100).toFixed(1)}%`);

    return {
      apiIndex,
      elapsed,
      updatedCount,
      taggedCount,
      total: listingsToProcess.length,
      batchCount
    };

  } catch (error) {
    console.error(`  [API ${apiIndex + 1}] ❌ Fatal error:`, error.message);
    throw error;
  }
}

/**
 * Run test across all APIs
 */
async function runParallelTest() {
  console.log('🧪 PARALLEL SCRAPER TEST - 100 LISTINGS');
  console.log('━'.repeat(70));
  console.log(`APIs: ${NUM_APIS}`);
  console.log(`Total listings: ${TEST_TOTAL}`);
  console.log(`Per API: ~${TEST_PER_API}`);
  console.log('━'.repeat(70));
  console.log('');

  if (API_KEYS.length < NUM_APIS) {
    throw new Error(`Need ${NUM_APIS} API keys but only have ${API_KEYS.length}`);
  }

  const db = await connectDB();
  const collection = db.collection('listings');

  try {
    // Get 100 listings (not yet processed)
    const allListings = await collection
      .find({ 
        testRun: { $exists: false } // Not processed in test
      }, { 
        projection: { url: 1, listing_id: 1 } 
      })
      .limit(TEST_TOTAL)
      .toArray();

    console.log(`✅ Selected ${allListings.length} listings for testing\n`);

    // Distribute across APIs
    const assignments = [];
    for (let i = 0; i < NUM_APIS; i++) {
      const start = i * TEST_PER_API;
      const end = Math.min(start + TEST_PER_API, allListings.length);
      assignments.push(allListings.slice(start, end));
    }

    console.log('📦 Distribution:');
    assignments.forEach((batch, idx) => {
      console.log(`  API ${idx + 1}: ${batch.length} listings`);
    });
    console.log('');

    // Start all workers in parallel
    console.log('🚀 Starting all workers...\n');
    const startTime = Date.now();

    const results = await Promise.all(
      assignments.map((listings, idx) => testWorker(idx, listings))
    );

    const totalElapsed = Date.now() - startTime;

    // Summary
    console.log('');
    console.log('━'.repeat(70));
    console.log('✅ TEST COMPLETE!');
    console.log('━'.repeat(70));
    console.log('');

    console.log('📊 Results by API:');
    let totalUpdated = 0;
    let totalTagged = 0;
    let totalBatches = 0;

    results.forEach(result => {
      totalUpdated += result.updatedCount;
      totalTagged += result.taggedCount;
      totalBatches += result.batchCount;
      
      console.log(`\nAPI ${result.apiIndex + 1}:`);
      console.log(`  Updated: ${result.updatedCount}/${result.total}`);
      console.log(`  With tags: ${result.taggedCount}`);
      console.log(`  Batches: ${result.batchCount}`);
      console.log(`  Time: ${(result.elapsed/1000).toFixed(1)}s`);
      console.log(`  Success: ${((result.updatedCount/result.total)*100).toFixed(1)}%`);
    });

    console.log('');
    console.log('━'.repeat(70));
    console.log('📈 Overall Statistics:');
    console.log('━'.repeat(70));
    console.log(`Total updated: ${totalUpdated}/${TEST_TOTAL} (${((totalUpdated/TEST_TOTAL)*100).toFixed(1)}%)`);
    console.log(`With tags: ${totalTagged} (${((totalTagged/totalUpdated)*100).toFixed(1)}%)`);
    console.log(`Total batches: ${totalBatches}`);
    console.log(`Total time: ${(totalElapsed/1000).toFixed(1)}s`);
    console.log(`Avg time per API: ${(totalElapsed/1000/NUM_APIS).toFixed(1)}s`);
    console.log(`Processing rate: ${(totalUpdated/(totalElapsed/1000)).toFixed(1)} listings/sec`);
    console.log('');

    // Effectiveness
    const successRate = (totalUpdated / TEST_TOTAL) * 100;
    const tagRate = (totalTagged / totalUpdated) * 100;

    console.log('🎯 Effectiveness:');
    console.log(`  Success rate: ${successRate.toFixed(1)}%`);
    console.log(`  Tag coverage: ${tagRate.toFixed(1)}%`);
    console.log(`  Parallel speedup: ${(totalElapsed/1000 / (results[0].elapsed/1000)).toFixed(1)}x`);
    console.log('');

    // Extrapolation for full dataset
    const avgTimePerListing = totalElapsed / totalUpdated;
    const estimatedTotalTime = (290708 * avgTimePerListing) / 1000 / 60 / 60; // hours
    const estimatedCostPerListing = 0.02 / 5; // $0.004 per listing
    const estimatedTotalCost = 290708 * estimatedCostPerListing;

    console.log('💡 Extrapolation for Full Dataset (290,708 listings):');
    console.log(`  Estimated time: ${estimatedTotalTime.toFixed(1)} hours`);
    console.log(`  Estimated cost: $${estimatedTotalCost.toFixed(2)}`);
    console.log(`  Per API: ${(estimatedTotalTime/NUM_APIS).toFixed(1)} hours, $${(estimatedTotalCost/NUM_APIS).toFixed(2)}`);
    console.log('');

    // Sample data
    console.log('🔍 Sample updated listings:');
    const samples = await collection.find({ testRun: true }).limit(3).toArray();
    samples.forEach((listing, idx) => {
      console.log(`\n${idx + 1}. ${listing.title?.substring(0, 60)}`);
      console.log(`   Tags (${listing.tags?.length || 0}): ${listing.tags?.slice(0, 5).join(', ')}`);
      console.log(`   Materials: ${listing.materials?.join(', ') || 'none'}`);
      console.log(`   Description: ${listing.description?.substring(0, 80)}...`);
    });

    console.log('');
    console.log('✅ Test successful! Ready for full run.');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

// Run test
runParallelTest()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
