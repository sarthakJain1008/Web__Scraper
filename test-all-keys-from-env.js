import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';

dotenv.config();

const API_ENV_VARS = [
  'APIFY_API_TOKEN',
  'APIFY_API_TOKEN_2',
  'APIFY_API_TOKEN_3',
  'APIFY_API_TOKEN_4',
  'APIFY_API_TOKEN_5',
  'APIFY_API_TOKEN_6',
  'APIFY_API_TOKEN_7',
  'APIFY_API_TOKEN_8',
  'APIFY_API_TOKEN_9',
  'APIFY_API_TOKEN_10',
];

const ETSY_URL = "https://www.etsy.com/listing/123456789/some-product"; // A dummy URL for testing

async function testAllKeys() {
  console.log('🧪 Starting test for all API keys found in .env file...');

  for (const envVar of API_ENV_VARS) {
    const apiKey = process.env[envVar];

    if (!apiKey) {
      console.log(`
--- ⏭️  Skipping ${envVar} (not set in .env) ---`);
      continue;
    }

    console.log(`
--- 🔍 Testing Key from ${envVar} (starts with: ${apiKey.substring(0, 15)}...) ---`);

    const client = new ApifyClient({ token: apiKey });

    try {
      const run = await client.actor('jupri/etsy-scraper').call({ query: ETSY_URL, limit: 1 });
      console.log(`--- ✅ TEST PASSED ---`);
      console.log(`   Scraper run ID: ${run.id}`);
    } catch (error) {
      console.log(`--- ❌ TEST FAILED ---`);
      console.error(`   Error: ${error.message}`);
    }
  }

  console.log('\n✅ All key tests complete.');
}

testAllKeys();
