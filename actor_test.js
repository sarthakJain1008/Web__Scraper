// actor_test.js
// A simple script to test a single API key and a single URL against the Apify actor.

import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.APIFY_API_TOKEN; // Uses the first API key in your .env
const TEST_URL = 'https://www.etsy.com/listing/123456789/some-product'; // A dummy URL

async function runTest() {
  if (!API_KEY) {
    console.error('Error: APIFY_API_TOKEN not found in your .env file.');
    return;
  }

  console.log(`Testing API Key starting with: ${API_KEY.substring(0, 15)}...`);

  const client = new ApifyClient({ token: API_KEY });

  try {
    console.log(`Calling actor 'jupri/etsy-scraper' with URL: ${TEST_URL}`);
    const run = await client.actor('jupri/etsy-scraper').call({
      query: TEST_URL,
      limit: 1
    });

    console.log('Actor call initiated. Waiting for it to finish...');
    const finishedRun = await client.run(run.id).waitForFinish();

    console.log('Run finished with status:', finishedRun.status);

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`Received ${items.length} items.`);
    console.log('Test successful!');

  } catch (error) {
    console.error('--- TEST FAILED ---');
    console.error('Error message:', error.message);
    console.error('-------------------');
  }
}

runTest();
