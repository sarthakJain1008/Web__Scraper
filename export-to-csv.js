// export-to-csv.js - Export all listings to CSV with metadata
import { MongoClient } from 'mongodb';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DATABASE || 'etsy_scraper';

async function exportToCSV() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    const collection = db.collection('listings');
    
    const totalCount = await collection.countDocuments();
    const categoriesCount = await collection.distinct('scrapedCategoryName').length;
    
    console.log(`📊 Total Listings: ${totalCount.toLocaleString('en-US')}`);
    console.log(`📂 Categories: ${categoriesCount}`);
    console.log('');
    console.log('🔄 Exporting to CSV...');
    
    // Define fields to export
    const fields = [
      // Etsy Listing Data
      'url',
      'title',
      'price',
      'shop_name',
      'shop_id',
      
      // Scraping Metadata
      'scrapedCountry',
      'scrapedCountryName',
      'scrapedCategoryName',
      'scrapedSearchTerm',
      'scrapedFacet',
      
      // Quality Indicators
      'isStarSeller',
      'isEtsyPick',
      'priceRange',
      'performanceTag',
      
      // Shop Metrics
      'shop_average_rating',
      'shop_total_rating_count',
      'is_top_rated',
      
      // Additional Data
      'listing_id',
      'views',
      'num_favorers',
      'shipping_type',
      'free_shipping',
      
      // Timestamps
      'scrapedAt'
    ];
    
    // Create CSV header
    const header = fields.join(',');
    
    // Open write stream
    const writeStream = fs.createWriteStream('etsy_listings_export.csv');
    writeStream.write(header + '\n');
    
    // Stream data from MongoDB
    const cursor = collection.find({}).project(
      fields.reduce((obj, field) => ({ ...obj, [field]: 1 }), { _id: 0 })
    );
    
    let count = 0;
    
    for await (const doc of cursor) {
      const row = fields.map(field => {
        let value = doc[field];
        
        // Handle different data types
        if (value === undefined || value === null) {
          return '';
        }
        
        if (typeof value === 'boolean') {
          return value ? 'true' : 'false';
        }
        
        if (value instanceof Date) {
          return value.toISOString();
        }
        
        // Escape quotes and commas for CSV
        value = String(value);
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        
        return value;
      });
      
      writeStream.write(row.join(',') + '\n');
      count++;
      
      if (count % 10000 === 0) {
        console.log(`  Exported ${count.toLocaleString('en-US')} listings...`);
      }
    }
    
    writeStream.end();
    
    console.log('');
    console.log('✅ Export complete!');
    console.log(`📁 File: etsy_listings_export.csv`);
    console.log(`📊 Total rows: ${count.toLocaleString('en-US')}`);
    console.log(`💾 Fields exported: ${fields.length}`);
    console.log('');
    console.log('📋 Exported Fields:');
    fields.forEach(f => console.log(`  - ${f}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

exportToCSV();
