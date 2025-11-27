import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'etsy_scraper';

async function findDuplicateWork() {
  let client;
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('listings');

    console.log('🔍 Analyzing for duplicate scraping work...');

    const duplicates = await collection.aggregate([
      // 1. Find all documents that have been scraped
      { $match: { detailsScrapedByApi: { $exists: true } } },
      
      // 2. Group by listing_id and count how many times each was scraped
      { 
        $group: {
          _id: "$listing_id",
          scrapeCount: { $sum: 1 },
          scrapedBy: { $push: "$detailsScrapedByApi" }
        }
      },
      
      // 3. Filter for listings that were scraped more than once
      { $match: { scrapeCount: { $gt: 1 } } },

      // 4. Sort by the most duplicated listings first
      { $sort: { scrapeCount: -1 } },

      // 5. Limit to the top 20 examples
      { $limit: 20 }
    ]).toArray();

    if (duplicates.length > 0) {
      console.log(`❌ Found ${duplicates.length} listings that were scraped multiple times. This confirms a bug.`);
      console.log('--- Top 20 Examples of Duplicate Work ---');
      duplicates.forEach(doc => {
        console.log(`- Listing ID: ${doc._id} was scraped ${doc.scrapeCount} times by workers: ${doc.scrapedBy.join(', ')}`);
      });
      console.log('-----------------------------------------');
    } else {
      console.log('✅ No duplicate scraping work found. The issue may lie elsewhere.');
    }

  } catch (error) {
    console.error('An error occurred during analysis:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

findDuplicateWork();
