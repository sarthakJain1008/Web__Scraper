// export-single-listing.js - Export one complete listing to CSV with all fields
import { MongoClient } from 'mongodb';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DATABASE || 'etsy_scraper';

async function exportSingleListing() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(dbName);
    const collection = db.collection('listings');
    
    // Get one listing with good data (star seller, multiple images)
    const listing = await collection.findOne({
      isStarSeller: true,
      listing_image_count: { $gte: 3 }
    });
    
    if (!listing) {
      console.log('❌ No listing found');
      return;
    }
    
    console.log('📋 Found listing:');
    console.log('   Title:', listing.title);
    console.log('   Shop:', listing.shop_name);
    console.log('   Price:', listing.price);
    console.log('   URL:', listing.url);
    console.log('');
    
    // Get all field names (excluding _id)
    const allFields = Object.keys(listing).filter(key => key !== '_id').sort();
    
    console.log('📊 Total fields:', allFields.length);
    console.log('');
    
    // Function to flatten nested objects and arrays for CSV
    function flattenValue(value, prefix = '') {
      if (value === null || value === undefined) {
        return { [prefix]: '' };
      }
      
      if (value instanceof Date) {
        return { [prefix]: value.toISOString() };
      }
      
      if (Array.isArray(value)) {
        // Convert arrays to JSON string
        return { [prefix]: JSON.stringify(value) };
      }
      
      if (typeof value === 'object') {
        // Convert objects to JSON string
        return { [prefix]: JSON.stringify(value) };
      }
      
      return { [prefix]: String(value) };
    }
    
    // Create flattened row
    const row = {};
    allFields.forEach(field => {
      const flattened = flattenValue(listing[field], field);
      Object.assign(row, flattened);
    });
    
    // Escape CSV values
    function escapeCSV(value) {
      if (value === null || value === undefined) return '';
      
      value = String(value);
      
      // If contains comma, quote, or newline, escape it
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      
      return value;
    }
    
    // Create CSV
    const headers = Object.keys(row).join(',');
    const values = Object.values(row).map(escapeCSV).join(',');
    
    const csvContent = headers + '\n' + values;
    
    // Write to file
    fs.writeFileSync('single_listing_all_fields.csv', csvContent);
    
    console.log('✅ Export complete!');
    console.log('📁 File: single_listing_all_fields.csv');
    console.log('📊 Fields exported:', Object.keys(row).length);
    console.log('');
    console.log('Sample fields included:');
    Object.keys(row).slice(0, 20).forEach((field, idx) => {
      const preview = String(row[field]).substring(0, 50);
      console.log(`  ${(idx + 1).toString().padStart(2)}. ${field.padEnd(35)} = ${preview}${String(row[field]).length > 50 ? '...' : ''}`);
    });
    
    if (Object.keys(row).length > 20) {
      console.log(`  ... and ${Object.keys(row).length - 20} more fields`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

exportSingleListing();
