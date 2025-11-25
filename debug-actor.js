// debug-actor.js - Debug actor run to see what's happening
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';

dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

console.log('🔍 Testing jupri/etsy-scraper with different inputs...\n');

// Test 1: Simple search
console.log('Test 1: Simple search term');
try {
  const input1 = {
    search: 'keychains',
    maxItems: 5
  };
  
  console.log('Input:', JSON.stringify(input1, null, 2));
  const run1 = await client.actor('jupri/etsy-scraper').call(input1, { waitSecs: 60 });
  console.log('Run ID:', run1.id);
  console.log('Status:', run1.status);
  
  const { items } = await client.dataset(run1.defaultDatasetId).listItems();
  console.log('Results:', items.length, 'items');
  
  if (items.length > 0) {
    console.log('Sample item keys:', Object.keys(items[0]));
  } else {
    console.log('⚠️  No items returned');
    
    // Check run log
    const log = await client.log(run1.id).get();
    console.log('\nLast 500 chars of log:');
    console.log(log.substring(log.length - 500));
  }
  
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n' + '='.repeat(60) + '\n');

// Test 2: URL-based
console.log('Test 2: Direct URL');
try {
  const input2 = {
    startUrls: ['https://www.etsy.com/search?q=keychains'],
    maxItems: 5
  };
  
  console.log('Input:', JSON.stringify(input2, null, 2));
  const run2 = await client.actor('jupri/etsy-scraper').call(input2, { waitSecs: 60 });
  console.log('Run ID:', run2.id);
  console.log('Status:', run2.status);
  
  const { items } = await client.dataset(run2.defaultDatasetId).listItems();
  console.log('Results:', items.length, 'items');
  
  if (items.length > 0) {
    console.log('Sample item:', JSON.stringify(items[0], null, 2).substring(0, 500));
  }
  
} catch (error) {
  console.error('Error:', error.message);
}
