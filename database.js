// database.js
// MongoDB connection and operations

import { MongoClient } from 'mongodb';

let client = null;
let db = null;

/**
 * Connect to MongoDB
 */
export async function connectDB() {
  if (db) {
    return db;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DATABASE || 'etsy_scraper';

  client = new MongoClient(mongoUri);
  await client.connect();
  
  db = client.db(dbName);
    // Create indexes for better query performance
    await db.collection('listings').createIndex({ 'url': 1 }, { unique: true, sparse: true });
    await db.collection('listings').createIndex({ 'subcategory': 1 });
    await db.collection('listings').createIndex({ 'scrapedAt': -1 });
    
    // New indexes for multi-country analysis
    await db.collection('listings').createIndex({ 'scrapedCountry': 1 });
    await db.collection('listings').createIndex({ 'scrapedCategoryName': 1 });
    await db.collection('listings').createIndex({ 'priceRange': 1 });
    await db.collection('listings').createIndex({ 'performanceTag': 1 });
    await db.collection('listings').createIndex({ 'isStarSeller': 1 });
    await db.collection('listings').createIndex({ 'scrapedSortBy': 1 });
    
    // Indexes for rank/position analysis
    await db.collection('listings').createIndex({ 'searchRank': 1 });
    await db.collection('listings').createIndex({ 'searchPage': 1 });
  
  console.log('✅ MongoDB connected successfully\n');
  
  return db;
}
/**
 * Close MongoDB connection
 */
export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('📦 MongoDB connection closed');
  }
}

/**
 * Insert Etsy listings into MongoDB
 * @param {string} subcategory - The subcategory name
 * @param {Array} listings - Array of listing objects from Apify
 * @returns {Object} Insert result with counts
 */
export async function insertListings(subcategory, listings) {
  const database = await connectDB();
  const collection = database.collection('listings');
  
  if (!listings || listings.length === 0) {
    return { inserted: 0, updated: 0, errors: 0 };
  }

  const scrapedAt = new Date();
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  // Process each listing with upsert to avoid duplicates
  for (const listing of listings) {
    try {
      const document = {
        ...listing,
        subcategory,
        scrapedAt,
        updatedAt: scrapedAt
      };

      const result = await collection.updateOne(
        { url: listing.url }, // Match by URL
        { 
          $set: document,
          $setOnInsert: { createdAt: scrapedAt }
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        inserted++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
      
    } catch (error) {
      console.error(`Error inserting listing: ${error.message}`);
      errors++;
    }
  }

  return { inserted, updated, errors };
}

/**
 * Get statistics from the database with multi-country analysis
 */
export async function getStats() {
  const database = await connectDB();
  const collection = database.collection('listings');
  
  const total = await collection.countDocuments();
  
  // By subcategory
  const bySubcategory = await collection.aggregate([
    { $group: { _id: '$subcategory', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  // By country
  const byCountry = await collection.aggregate([
    { $group: { _id: '$scrapedCountry', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  // By price range
  const byPriceRange = await collection.aggregate([
    { $group: { _id: '$priceRange', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  // By performance
  const byPerformance = await collection.aggregate([
    { $group: { _id: '$performanceTag', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  // Star sellers count
  const starSellers = await collection.countDocuments({ isStarSeller: true });

  return {
    totalListings: total,
    starSellers,
    bySubcategory: bySubcategory.map(item => ({
      subcategory: item._id,
      count: item.count
    })),
    byCountry: byCountry.map(item => ({
      country: item._id,
      count: item.count
    })),
    byPriceRange: byPriceRange.map(item => ({
      range: item._id,
      count: item.count
    })),
    byPerformance: byPerformance.map(item => ({
      performance: item._id,
      count: item.count
    }))
  };
}
