// check-actor-input.js - Check actor input schema
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';

dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function checkActor(actorId) {
  console.log(`\n🔍 Checking actor: ${actorId}\n`);
  
  try {
    const actor = await client.actor(actorId).get();
    
    console.log(`Title: ${actor.title}`);
    console.log(`Description: ${actor.description?.substring(0, 200)}...`);
    console.log(`\nInput Schema:`);
    
    if (actor.defaultRunOptions?.build?.input) {
      console.log(JSON.stringify(actor.defaultRunOptions.build.input, null, 2));
    }
    
    // Try to get the input schema from the actor's README or example
    console.log(`\nExample Run Configuration:`);
    if (actor.exampleRunInput) {
      console.log(JSON.stringify(actor.exampleRunInput, null, 2));
    } else {
      console.log('No example input found in actor metadata');
    }
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Check both actors
await checkActor('jupri/etsy-scraper');
await checkActor('epctex/etsy-scraper');
