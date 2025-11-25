// test-params.js - Test different parameter combinations
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';

dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

const testCases = [
  { name: 'Empty input', input: {} },
  { name: 'Just URL', input: { url: 'https://www.etsy.com/search?q=keychains' } },
  { name: 'URLs array', input: { urls: ['https://www.etsy.com/search?q=keychains'] } },
  { name: 'Query param', input: { query: 'keychains' } },
  { name: 'Q param', input: { q: 'keychains' } },
  { name: 'Keyword param', input: { keyword: 'keychains' } },
];

for (const test of testCases) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${test.name}`);
  console.log(`Input: ${JSON.stringify(test.input)}`);
  
  try {
    const run = await client.actor('jupri/etsy-scraper').call(test.input, { waitSecs: 30 });
    
    // Get log to see error messages
    const logStream = await client.log(run.id).stream();
    let logContent = '';
    
    for await (const chunk of logStream) {
      logContent += chunk.toString();
    }
    
    // Show last part of log
    const lastLines = logContent.split('\n').slice(-5).join('\n');
    console.log('Log output:');
    console.log(lastLines);
    
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`✅ Results: ${items.length} items`);
    
    if (items.length > 0) {
      console.log('🎉 SUCCESS! This input format works!');
      break;
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}
