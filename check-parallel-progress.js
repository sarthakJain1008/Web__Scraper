// check-parallel-progress.js
// Monitor progress of parallel scraping across all API keys

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function checkProgress() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('etsy_scraper');
    const collection = db.collection('listings');
    
    console.log('📊 PARALLEL SCRAPING PROGRESS');
    console.log('━'.repeat(70));
    console.log('');
    
    // Overall statistics
    const total = await collection.countDocuments({});
    const processed = await collection.countDocuments({
      detailsScrapedByApi: { $exists: true }
    });
    const withTags = await collection.countDocuments({
      tags: { $exists: true, $ne: [] }
    });
    const withDescription = await collection.countDocuments({
      description: { $exists: true, $ne: null }
    });
    
    console.log('🌍 Overall Progress:');
    console.log(`  Total listings: ${total.toLocaleString()}`);
    console.log(`  Processed: ${processed.toLocaleString()} (${((processed/total)*100).toFixed(1)}%)`);
    console.log(`  With tags: ${withTags.toLocaleString()} (${((withTags/total)*100).toFixed(1)}%)`);
    console.log(`  With description: ${withDescription.toLocaleString()} (${((withDescription/total)*100).toFixed(1)}%)`);
    console.log('');
    
    // Progress per API key
    console.log('📋 Progress by API Key:');
    console.log('━'.repeat(70));
    
    // Get a distinct list of all API indexes that have been used
    const usedApiIndexes = await collection.distinct('detailsScrapedByApi');
    
    for (const apiIndex of usedApiIndexes.sort((a, b) => a - b)) {
      if (apiIndex === null) continue; // Skip any listings that weren't marked with an API
      const apiProcessed = await collection.countDocuments({
        detailsScrapedByApi: apiIndex
      });
      
      const apiWithTags = await collection.countDocuments({
        detailsScrapedByApi: apiIndex,
        tags: { $exists: true, $ne: [] }
      });
      
      const progress = (apiProcessed / total) * 100;
      const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
      
      console.log(`\nAPI ${apiIndex + 1}:`);
      console.log(`  ${progressBar} ${progress.toFixed(1)}%`);
      console.log(`  Processed: ${apiProcessed.toLocaleString()}`);
      console.log(`  With tags: ${apiWithTags.toLocaleString()}`);
      
      if (apiProcessed > 0) {
        // Get last processed timestamp
        const lastProcessed = await collection.findOne(
          { detailsScrapedByApi: apiIndex },
          { sort: { detailsScrapedAt: -1 }, projection: { detailsScrapedAt: 1 } }
        );
        
        if (lastProcessed) {
          const timeDiff = Date.now() - lastProcessed.detailsScrapedAt.getTime();
          const minutesAgo = Math.floor(timeDiff / 60000);
          console.log(`  Last update: ${minutesAgo} minutes ago`);
        }
      }
    }
    
    console.log('');
    console.log('━'.repeat(70));
    
    // Estimate completion
    if (processed > 0) {
      const remaining = total - processed;
      
      // Get first and last processed
      const first = await collection.findOne(
        { detailsScrapedAt: { $exists: true } },
        { sort: { detailsScrapedAt: 1 }, projection: { detailsScrapedAt: 1 } }
      );
      
      const last = await collection.findOne(
        { detailsScrapedAt: { $exists: true } },
        { sort: { detailsScrapedAt: -1 }, projection: { detailsScrapedAt: 1 } }
      );
      
      if (first && last) {
        const elapsed = last.detailsScrapedAt - first.detailsScrapedAt;
        const rate = processed / (elapsed / 1000 / 60); // listings per minute
        const eta = remaining / rate; // minutes
        
        console.log('⏱️  Time Estimates:');
        console.log(`  Processing rate: ${rate.toFixed(1)} listings/minute`);
        console.log(`  Remaining: ${remaining.toLocaleString()} listings`);
        console.log(`  ETA: ${eta.toFixed(0)} minutes (~${(eta/60).toFixed(1)} hours)`);
        console.log('');
      }
    }
    
    // Cost estimate
    const estimatedCost = (processed / 5) * 0.02; // 5 listings per $0.02 call
    const totalEstimatedCost = (total / 5) * 0.02;
    
    console.log('💰 Cost Estimate:');
    console.log(`  Spent so far: ~$${estimatedCost.toFixed(2)}`);
    console.log(`  Total estimated: ~$${totalEstimatedCost.toFixed(2)}`);
    console.log(`  Remaining: ~$${(totalEstimatedCost - estimatedCost).toFixed(2)}`);
    console.log('');
    
    // Sample recent updates
    console.log('🔍 Recent Updates:');
    const recentSamples = await collection.find({
      detailsScrapedAt: { $exists: true }
    }).sort({ detailsScrapedAt: -1 }).limit(3).toArray();
    
    recentSamples.forEach((listing, idx) => {
      console.log(`\n${idx + 1}. ${listing.title?.substring(0, 60)}`);
      console.log(`   API: ${listing.detailsScrapedByApi + 1} | Tags: ${listing.tags?.length || 0} | Materials: ${listing.materials?.length || 0}`);
    });
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

// Run
checkProgress()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
