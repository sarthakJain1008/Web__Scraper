// debug-fields.js - Check what fields the actor actually returns
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DATABASE || 'etsy_scraper_test';

async function main() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('listings');

    // Get a sample listing
    const sample = await collection.findOne({ scrapedCategory: { $exists: true } });
    
    if (!sample) {
      console.log('No listings found');
      return;
    }

    console.log('🔍 Sample Listing Fields:\n');
    console.log('Available keys:', Object.keys(sample).sort());
    
    console.log('\n📊 Star Seller Related Fields:');
    console.log('  isStarSeller:', sample.isStarSeller);
    console.log('  is_star_seller:', sample.is_star_seller);
    console.log('  starSeller:', sample.starSeller);
    console.log('  star_seller:', sample.star_seller);
    
    console.log('\n🎨 Etsy Pick Related Fields:');
    console.log('  isEtsyPick:', sample.isEtsyPick);
    console.log('  is_merch_library:', sample.is_merch_library);
    console.log('  isMerchLibrary:', sample.isMerchLibrary);
    console.log('  merch_library:', sample.merch_library);
    
    console.log('\n🏷️  Facet Fields:');
    console.log('  scrapedFacet:', sample.scrapedFacet);
    
    console.log('\n📈 Performance Fields:');
    console.log('  numReviews:', sample.numReviews);
    console.log('  reviewCount:', sample.reviewCount);
    console.log('  num_reviews:', sample.num_reviews);
    console.log('  rating:', sample.rating);
    console.log('  averageRating:', sample.averageRating);
    
    // Count by facet
    console.log('\n📊 Distribution by scrapedFacet:');
    const facetCounts = await collection.aggregate([
      { $match: { scrapedCategory: { $exists: true } } },
      { $group: { _id: '$scrapedFacet', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    facetCounts.forEach(f => {
      console.log(`  ${f._id}: ${f.count}`);
    });
    
    // Check if any have star seller in facet
    const starSellerFacet = await collection.countDocuments({ scrapedFacet: 'star_seller' });
    const etsyPickFacet = await collection.countDocuments({ scrapedFacet: 'etsy_pick' });
    
    console.log(`\n✨ Items tagged with star_seller facet: ${starSellerFacet}`);
    console.log(`🎨 Items tagged with etsy_pick facet: ${etsyPickFacet}`);
    
    console.log('\n📦 Full Sample Item (first 1000 chars):');
    console.log(JSON.stringify(sample, null, 2).substring(0, 1000));
    
  } finally {
    await client.close();
  }
}

main().catch(console.error);
