// scrape-optimized-trio.js
// Divide ONLY remaining unprocessed listings equally across 3 workers
// Each worker can be launched with its own token via CUSTOM_APIFY_TOKEN
// and picks its shard using TRIO_INDEX (0,1,2) with TRIO_COUNT=3.

import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './database.js';
import { API_KEYS } from './api-keys.config.js';

dotenv.config();

const BATCH_SIZE = 5; // URLs per API call
const DELAY_BETWEEN_CALLS = 2000; // 2 seconds
const MAX_RETRIES = 3;

// Trio configuration
const TRIO_COUNT = parseInt(process.env.TRIO_COUNT || '3', 10);
const TRIO_INDEX = parseInt(process.env.TRIO_INDEX || process.env.API_KEY_INDEX || '0', 10);

if (TRIO_COUNT !== 3) {
  console.warn(`⚠️ TRIO_COUNT=${TRIO_COUNT} (expected 3). Proceeding anyway.`);
}
if (TRIO_INDEX < 0 || TRIO_INDEX >= TRIO_COUNT) {
  throw new Error(`Invalid TRIO_INDEX ${TRIO_INDEX}. Must be 0..${TRIO_COUNT - 1}`);
}

// Use a custom token if provided, else fall back to API_KEYS[TRIO_INDEX]
const TOKEN = process.env.CUSTOM_APIFY_TOKEN || API_KEYS[TRIO_INDEX];
if (!TOKEN) {
  throw new Error('No Apify token provided. Set CUSTOM_APIFY_TOKEN or ensure API_KEYS[TRIO_INDEX] exists.');
}

// Optional: track progress under a specific legacy API index (0..9) for dashboards
// If not set, will use TRIO_INDEX which may not align with original 10-API dashboard buckets.
const PROGRESS_API_INDEX = process.env.PROGRESS_API_INDEX !== undefined
  ? parseInt(process.env.PROGRESS_API_INDEX, 10)
  : TRIO_INDEX;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function trioScrape() {
  console.log('🔍 OPTIMIZED TRIO SCRAPER');
  console.log('━'.repeat(70));
  console.log(`Trio index: ${TRIO_INDEX + 1}/${TRIO_COUNT}`);
  console.log(`Batch size: ${BATCH_SIZE} URLs per call`);
  console.log('Strategy: Only REMAINING unprocessed listings, evenly sharded across trio');
  console.log('━'.repeat(70));
  console.log('');

  const client = new ApifyClient({ token: TOKEN });
  const db = await connectDB();
  const collection = db.collection('listings');

  try {
    const totalListings = await collection.countDocuments({});
    const alreadyProcessed = await collection.countDocuments({ detailsScrapedByApi: { $exists: true } });
    const remaining = totalListings - alreadyProcessed;

    console.log('📊 Database Status:');
    console.log(`  Total listings: ${totalListings.toLocaleString()}`);
    console.log(`  Already processed: ${alreadyProcessed.toLocaleString()}`);
    console.log(`  Remaining: ${remaining.toLocaleString()}`);
    console.log('');

    if (remaining <= 0) {
      console.log('✅ Nothing remaining to process. Exiting.');
      return;
    }

    // Fetch remaining (not processed yet)
    const unprocessed = await collection
      .find({ detailsScrapedByApi: { $exists: false } }, { projection: { url: 1, listing_id: 1 } })
      .toArray();

    if (unprocessed.length === 0) {
      console.log('✅ No unprocessed listings found. Exiting.');
      return;
    }

    // Determine shard for this worker
    const perMember = Math.ceil(unprocessed.length / TRIO_COUNT);
    const start = TRIO_INDEX * perMember;
    const end = Math.min(start + perMember, unprocessed.length);
    const myListings = unprocessed.slice(start, end);

    console.log('📊 Trio Assignment:');
    console.log(`  Unprocessed total: ${unprocessed.length.toLocaleString()}`);
    console.log(`  Per member: ${perMember.toLocaleString()}`);
    console.log(`  My indices: ${start.toLocaleString()} - ${end.toLocaleString()}`);
    console.log(`  My count: ${myListings.length.toLocaleString()}`);
    console.log('');

    if (myListings.length === 0) {
      console.log('✅ No listings assigned to this worker (others may have completed them).');
      return;
    }

    // Split into batches
    const batches = [];
    for (let i = 0; i < myListings.length; i += BATCH_SIZE) {
      batches.push(myListings.slice(i, i + BATCH_SIZE));
    }

    console.log(`📦 Created ${batches.length.toLocaleString()} batches of ${BATCH_SIZE} URLs`);
    console.log('');

    const estimatedCost = batches.length * 0.02;
    const estimatedTimeMin = (batches.length * (DELAY_BETWEEN_CALLS + 30000)) / 1000 / 60;
    console.log('💰 Cost Estimation:');
    console.log(`  - API calls: ${batches.length.toLocaleString()}`);
    console.log(`  - Cost per call: $0.02`);
    console.log(`  - Total estimated cost: $${estimatedCost.toFixed(2)}`);
    console.log('');
    console.log('⏱️  Time Estimation:');
    console.log(`  - Estimated time: ${estimatedTimeMin.toFixed(0)} minutes (~${(estimatedTimeMin / 60).toFixed(1)} hours)`);
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
      console.log(`\n[TRIO ${TRIO_INDEX + 1}] [Batch ${batchNum}/${batches.length}] Processing ${batch.length} URLs...`);

      let retries = 0;
      let success = false;

      while (retries < MAX_RETRIES && !success) {
        try {
          const urls = batch.map(b => b.url);
          console.log(`  📤 Calling Apify actor with ${urls.length} URLs...`);

          const run = await client.actor('jupri/etsy-scraper').call({
            query: urls.join('\n'),
            limit: urls.length
          }, { waitSecs: 0 });

          console.log(`  ⏳ Waiting for run ${run.id} to complete...`);
          await client.run(run.id).waitForFinish();

          const { items } = await client.dataset(run.defaultDatasetId).listItems();
          console.log(`  ✅ Received ${items.length} items`);

          if (items.length > 0) {
            for (const item of items) {
              const listing = item.listing || item;
              if (!listing.listing_id) {
                console.log('  ⚠️  Skipping item without listing_id');
                continue;
              }

              const updateData = {
                tags: listing.tags || [],
                materials: listing.materials || [],
                category_tags: listing.category_tags || [],
                description: listing.description || null,
                who_made: listing.who_made || null,
                when_made: listing.when_made || null,
                has_star_seller_signal: listing.has_star_seller_signal || false,
                is_bestseller: listing.is_bestseller || false,
                is_bestseller_by_fixed_qty_category_l3: listing.is_bestseller_by_fixed_qty_category_l3 || false,
                is_bestseller_by_fixed_qty_category_leaf: listing.is_bestseller_by_fixed_qty_category_leaf || false,
                is_made_to_order: listing.is_made_to_order || false,
                is_top_rated: listing.is_top_rated || false,
                free_shipping_countries: listing.free_shipping_countries || [],
                free_shipping_data: listing.free_shipping_data || null,
                item_details: listing.item_details || [],
                detailsScrapedAt: new Date(),
                detailsScrapedBatch: batchNum,
                detailsScrapedByApi: PROGRESS_API_INDEX, // Track under desired legacy index
                optimizedScraper: true,
              };

              const result = await collection.updateOne(
                { listing_id: listing.listing_id },
                { $set: updateData }
              );
              if (result.modifiedCount > 0) updatedCount++;
            }
            console.log(`  💾 Updated ${items.length} listings in database`);
          } else {
            console.log('  ⚠️  No items returned for this batch');
            for (const l of batch) {
              await collection.updateOne(
                { listing_id: l.listing_id },
                { $set: { detailsScrapedByApi: PROGRESS_API_INDEX, detailsScrapedAt: new Date(), detailsScrapeBatchEmpty: true, optimizedScraper: true } }
              );
            }
          }

          successCount++;
          success = true;
        } catch (err) {
          retries++;
          console.error(`  ❌ Error (attempt ${retries}/${MAX_RETRIES}):`, err.message);
          if (retries < MAX_RETRIES) {
            console.log('  🔄 Retrying in 5 seconds...');
            await sleep(5000);
          } else {
            console.error(`  ❌ Failed after ${MAX_RETRIES} retries, skipping batch`);
            errorCount++;
          }
        }
      }

      processedBatches++;
      if (batchNum % 10 === 0 || batchNum === batches.length) {
        const pct = ((processedBatches / batches.length) * 100).toFixed(1);
        console.log(`\n  📊 Progress: ${processedBatches}/${batches.length} (${pct}%)`);
        console.log(`  ✅ Success: ${successCount} | ❌ Errors: ${errorCount} | 💾 Updated: ${updatedCount}`);
        console.log(`  💰 Cost so far: $${(successCount * 0.02).toFixed(2)}`);
      }

      if (batchIndex < batches.length - 1) {
        await sleep(DELAY_BETWEEN_CALLS);
      }
    }

    console.log('');
    console.log('━'.repeat(70));
    console.log('✅ TRIO WORKER COMPLETE!');
    console.log('━'.repeat(70));
    console.log('');
    console.log('📊 Final Statistics:');
    console.log(`  Total batches: ${processedBatches}`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Failed: ${errorCount}`);
    console.log(`  Listings updated: ${updatedCount.toLocaleString()}`);
    console.log('');
  } catch (err) {
    console.error('❌ Fatal error:', err);
    throw err;
  } finally {
    await closeDB();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  trioScrape()
    .then(() => { console.log('\n✅ Script completed successfully'); process.exit(0); })
    .catch((err) => { console.error('\n❌ Script failed:', err); process.exit(1); });
}

export { trioScrape };
