// verify-token.js - Test new Apify token
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';

dotenv.config();

async function verifyToken() {
  const token = process.env.APIFY_API_TOKEN;
  
  if (!token || token === 'your_apify_token_here') {
    console.log('❌ ERROR: APIFY_API_TOKEN not set in .env file');
    console.log('Please update your .env file with the new token');
    process.exit(1);
  }
  
  console.log('🔍 Testing Apify API token...\n');
  console.log('Token:', token.substring(0, 20) + '...');
  
  try {
    const client = new ApifyClient({ token });
    
    // Test API by getting user info
    const user = await client.user().get();
    
    console.log('\n✅ Token is valid!');
    console.log('👤 User:', user.username);
    console.log('📧 Email:', user.email);
    console.log('💰 Credits:', user.monthlyUsageCredits || 'N/A');
    console.log('📊 Usage limit:', user.monthlyUsageCreditsLimit || 'Free tier');
    console.log('\n🎉 Ready to resume scraping!');
    
  } catch (error) {
    console.log('\n❌ Token verification failed!');
    console.log('Error:', error.message);
    console.log('\nPlease check:');
    console.log('1. Token is correctly copied (no spaces)');
    console.log('2. Token is from the correct Apify account');
    console.log('3. Account is active and verified');
    process.exit(1);
  }
}

verifyToken();
