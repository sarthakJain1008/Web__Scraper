# Resume Scraping Guide

## Current Status
- ✅ Scraped: 109,058 listings
- ✅ Categories completed: 112 / 333
- ⏸️ Stopped: Apify limit reached
- 📊 Remaining: 221 categories

## How to Resume with New Apify Account

### Step 1: Get New API Token

1. Go to [apify.com](https://apify.com)
2. Sign up/login with your new Google account
3. Navigate to: **Settings → Integrations**
4. Copy your **API Token** (starts with `[your_api_key_here]`)

### Step 2: Update .env File

Edit your `.env` file and replace the old token:

```bash
APIFY_API_TOKEN=apify_api_YOUR_NEW_TOKEN_HERE
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=etsy_scraper
NUM_WORKERS=5
LISTINGS_PER_COUNTRY=300
CSV_FILE_PATH=./categories.csv
TEST_MODE=false
```

**Important**: Use the **same** `MONGODB_DATABASE=etsy_scraper` to continue with existing data!

### Step 3: Verify New Token

```bash
node verify-token.js
```

You should see:
```
✅ Token is valid!
👤 User: your_username
📧 Email: your_email
🎉 Ready to resume scraping!
```

### Step 4: Resume Scraping

Simply restart the scraper:

```bash
./START_PRODUCTION.sh
```

Or manually:

```bash
npm start
```

### How Resume Works Automatically

The scraper will **automatically skip** already-scraped listings because:

1. **MongoDB Unique Index** on `url` field
2. **Upsert Logic** - existing URLs get updated, not duplicated
3. **Categories** - Already completed categories will be processed again, but:
   - Duplicate URLs won't be inserted
   - Only new or updated listings will be added
   - You'll see more "updated" vs "new" in the logs

### Expected Behavior When Resuming

**Logs will show:**
```
[baby-pants] 💾 Stored in DB: 5 new, 235 updated (5/5 countries)
```

- **New**: Listings not in DB yet
- **Updated**: Listings already scraped (safe to ignore)

### Remaining Work

- **Categories left**: 221
- **Estimated listings**: ~215,000 more
- **Estimated time**: ~18-22 hours (with 5 workers)
- **Estimated cost**: ~$4.42 (221 × 20 calls × $0.001)

### Monitor Progress

```bash
# Check live logs
tail -f logs/scraper_*.log

# Check database stats
npm run query

# Or check MongoDB directly
mongosh etsy_scraper --eval "db.listings.countDocuments()"
```

### If You Want Fresh Start Instead

**Only if you want to start completely fresh** (not recommended):

```bash
# Change database name in .env
MONGODB_DATABASE=etsy_scraper_fresh

# Then run scraper
npm start
```

This will create a new database and scrape all 333 categories from scratch.

---

## Quick Commands

```bash
# 1. Verify token
node verify-token.js

# 2. Start scraping
./START_PRODUCTION.sh

# 3. Monitor progress
tail -f logs/scraper_*.log

# 4. Check stats
npm run query
```

---

## Troubleshooting

### "Monthly usage hard limit exceeded"
- Your new account hit the limit
- Check Apify dashboard for usage
- May need to wait until monthly reset or upgrade plan

### "Invalid token"
- Token not updated in .env
- Extra spaces in token
- Run `node verify-token.js` to test

### "MongoDB connection error"
- MongoDB not running
- Run: `brew services start mongodb-community@6.0`

---

**Ready to resume?** Run `node verify-token.js` then `./START_PRODUCTION.sh`!
