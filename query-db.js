// query-db.js
// Helper script to query MongoDB data

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DATABASE || 'etsy_scraper';

async function main() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    
    const db = client.db(dbName);
    const collection = db.collection('listings');

    // Total count
  const totalCount = await collection.countDocuments();
  console.log(`📊 Total listings: ${totalCount}\n`);

  // Count by country
  console.log('🌍 Listings by country:');
  const byCountry = await collection.aggregate([
    { $group: { _id: '$scrapedCountry', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  
  byCountry.forEach(item => {
    console.log(`  - ${item._id || 'Unknown'}: ${item.count} listings`);
  });

  // Count by price range
  console.log('\n💰 Listings by price range:');
  const byPriceRange = await collection.aggregate([
    { $group: { _id: '$priceRange', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  
  byPriceRange.forEach(item => {
    console.log(`  - ${item._id || 'Unknown'}: ${item.count} listings`);
  });

  // Count by performance
  console.log('\n⭐ Listings by performance:');
  const byPerformance = await collection.aggregate([
    { $group: { _id: '$performanceTag', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  
  byPerformance.forEach(item => {
    console.log(`  - ${item._id || 'Unknown'}: ${item.count} listings`);
  });

  // Star sellers
  const starSellers = await collection.countDocuments({ isStarSeller: true });
  console.log(`\n🌟 Star Sellers: ${starSellers} (${((starSellers/totalCount)*100).toFixed(1)}%)`);

  // Count by subcategory (top 10)
  console.log('\n📋 Top 10 categories by listing count:');
  const bySubcategory = await collection.aggregate([
    { $group: { _id: '$scrapedCategoryName', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]).toArray();
  
  bySubcategory.forEach(item => {
    console.log(`  - ${item._id || 'Unknown'}: ${item.count} listings`);
  });

    // Most recent scrapes
    console.log('\n🕐 Most recent scrapes:');
    const recent = await collection.aggregate([
      { $group: { _id: '$subcategory', lastScraped: { $max: '$scrapedAt' } } },
      { $limit: 5 }
    ]).toArray();
    
    recent.forEach(item => {
      console.log(`  - ${item._id}: ${new Date(item.lastScraped).toLocaleString()}`);
    });

    // Sample listings
    console.log('\n📦 Sample listings (first 3):');
    const samples = await collection.find({}).limit(3).toArray();
    samples.forEach((listing, idx) => {
      console.log(`\n${idx + 1}. ${listing.title || 'No title'}`);
      console.log(`   URL: ${listing.url || 'No URL'}`);
      console.log(`   Price: ${listing.price || 'N/A'}`);
      console.log(`   Subcategory: ${listing.subcategory}`);
      console.log(`   Scraped: ${new Date(listing.scrapedAt).toLocaleString()}`);
    });

    // Export sample to JSON
    console.log('\n💾 Exporting first 10 listings to sample-output.json...');
    const sampleExport = await collection.find({}).limit(10).toArray();
    const fs = await import('fs');
    fs.writeFileSync('sample-output.json', JSON.stringify(sampleExport, null, 2));
    console.log('✅ Exported successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n📦 Connection closed');
  }
}

main().catch(console.error);
