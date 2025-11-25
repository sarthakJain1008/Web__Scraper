// find-actor.js - Find the correct Etsy scraper actor
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';

dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

console.log('🔍 Searching for Etsy scraper actors...\n');

try {
  // Search for Etsy scrapers in the store
  const actors = await client.actors().list({ my: false });
  
  const etsyActors = actors.items.filter(actor => 
    actor.name.toLowerCase().includes('etsy') ||
    actor.title?.toLowerCase().includes('etsy')
  );
  
  console.log(`Found ${etsyActors.length} Etsy-related actors:\n`);
  
  etsyActors.forEach((actor, idx) => {
    console.log(`${idx + 1}. ${actor.username}/${actor.name}`);
    console.log(`   Title: ${actor.title || 'N/A'}`);
    console.log(`   ID: ${actor.id}`);
    console.log();
  });
  
  if (etsyActors.length === 0) {
    console.log('No Etsy actors found. Trying direct actor IDs...\n');
    
    const tryActors = [
      'apify/etsy-scraper',
      'trudax/etsy-scraper',
      'dtrungtin/etsy-scraper',
      'epctex/etsy-scraper'
    ];
    
    for (const actorId of tryActors) {
      try {
        const actor = await client.actor(actorId).get();
        console.log(`✅ Found: ${actorId}`);
        console.log(`   Title: ${actor.title}`);
        console.log(`   Description: ${actor.description?.substring(0, 100)}...`);
        console.log();
      } catch (e) {
        console.log(`❌ Not found: ${actorId}`);
      }
    }
  }
  
} catch (error) {
  console.error('Error:', error.message);
}
