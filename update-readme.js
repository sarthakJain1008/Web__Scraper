import { MongoClient } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'etsy_scraper';
const README_PATH = path.resolve(process.cwd(), 'README.md');
const TOTAL_LISTINGS_IN_DB = 290708; // The total number of listings to be scraped

async function updateReadme() {
  let client;
  try {
    // --- 1. Connect to MongoDB ---
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('listings');

    console.log('📊 Connected to MongoDB to fetch progress...');

    // --- 2. Fetch Progress Data ---
    const scrapedCount = await collection.countDocuments({ detailsScrapedAt: { $exists: true } });
    const progressPercentage = Math.round((scrapedCount / TOTAL_LISTINGS_IN_DB) * 100);

    console.log(`✅ Found ${scrapedCount.toLocaleString()} scraped listings (${progressPercentage}%)`);

    // --- 3. Read README.md ---
    let readmeContent = await fs.readFile(README_PATH, 'utf-8');
    console.log('📄 Read README.md file...');

    // --- 4. Update Progress Badge and Text ---
    // Update the progress bar
    readmeContent = readmeContent.replace(
      /!\[Progress\]\(https:\/\/progress-bar\.dev\/\d+\/?title=Scraped\)/,
      `![Progress](https://progress-bar.dev/${progressPercentage}/?title=Scraped)`
    );

    // Update the listings scraped count
    readmeContent = readmeContent.replace(
      /`\d{1,3}(,\d{3})* \/ \d{1,3}(,\d{3})*`/,
      `\`${scrapedCount.toLocaleString()} / ${TOTAL_LISTINGS_IN_DB.toLocaleString()}\``
    );

    console.log('🔄 Updated progress metrics in README content...');

    // --- 5. Write Updated README.md ---
    await fs.writeFile(README_PATH, readmeContent, 'utf-8');
    console.log('✅ Successfully updated README.md!');

  } catch (error) {
    console.error('❌ An error occurred while updating the README:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔗 Closed MongoDB connection.');
    }
  }
}

updateReadme();
