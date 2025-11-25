// api-keys.config.js
// Configuration for multiple Apify API keys
// Add your 10 API keys here

import dotenv from 'dotenv';
dotenv.config();

export const API_KEYS = [
  process.env.APIFY_API_TOKEN,  // Key 1 (from .env)
  process.env.APIFY_API_TOKEN_2,
  process.env.APIFY_API_TOKEN_3,
  process.env.APIFY_API_TOKEN_4,
  process.env.APIFY_API_TOKEN_5,
  process.env.APIFY_API_TOKEN_6,
  process.env.APIFY_API_TOKEN_7,
  process.env.APIFY_API_TOKEN_8,
  process.env.APIFY_API_TOKEN_9,
  process.env.APIFY_API_TOKEN_10,
].filter(key => key); // Remove undefined keys

// Validate at least one key exists
if (API_KEYS.length === 0) {
  throw new Error('No API keys configured! Please set APIFY_API_TOKEN in .env');
}

console.log(`✅ Loaded ${API_KEYS.length} API key(s)`);
