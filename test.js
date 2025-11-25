// test.js - Test with sampling strategy (1 category, 50 per country for quick validation)
import dotenv from 'dotenv';

// Override with test settings
process.env.TEST_MODE = 'true';
process.env.TEST_CATEGORIES = '1';
process.env.NUM_WORKERS = '1';
process.env.LISTINGS_PER_COUNTRY = '50';  // 50 per country to test distribution
process.env.MONGODB_DATABASE = 'etsy_scraper_test';

// Load regular .env
dotenv.config();

console.log('🧪 TEST MODE: 1 category, 50 listings per country (250 total expected)');
console.log('📊 Testing sampling strategy with star sellers, Etsy picks, and sort diversity\n');

// Import and run main
import('./index.js');
