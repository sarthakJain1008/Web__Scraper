# Quick Start Guide

## ✅ Ready to Run!

Everything is already configured. Just follow these 3 steps:

### Step 1: Add Your 1000 Categories

Replace the sample `categories.csv` with your 1000 categories:

```csv
category
vintage jewelry
handmade pottery
leather wallets
... (add 997 more)
```

**Important:** Keep the header row `category` as the first line.

### Step 2: Start MongoDB

Choose one option:

**Option A - Docker (Recommended):**
```bash
docker-compose up -d
```

**Option B - Local Install:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Option C - MongoDB Atlas:**
Update `.env` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

### Step 3: Run the Scraper

```bash
npm start
```

## 📊 What Happens

1. Reads your 1000 categories from CSV
2. Splits into 5 workers (200 categories each)
3. Each worker scrapes 100 Etsy listings per category
4. Stores ~100,000 listings in MongoDB
5. Shows real-time progress and statistics

## ⏱️ Expected Runtime

- **Per category:** ~30-60 seconds (Apify processing time)
- **Per worker:** 200 categories × 45 sec avg = ~2.5 hours
- **Total (5 workers in parallel):** ~2.5-3 hours for all 1000 categories

## 💾 Query Your Data

After scraping completes:

```bash
npm run query
```

This shows:
- Total listings count
- Breakdown by category
- Sample data
- Exports first 10 listings to `sample-output.json`

## Configuration

All settings in `.env`:

```env
APIFY_API_TOKEN=[your_api_key_here]  # 
CSV_FILE_PATH=./categories.csv                                  # Your CSV file
NUM_WORKERS=5                                                    # Concurrent workers
MAX_LISTINGS_PER_CATEGORY=100                                    # Listings per category
MONGODB_URI=mongodb://localhost:27017                            # MongoDB connection
```

## Important Notes
## 🚨 Important Notes

1. **Apify Costs:** 1000 categories × 100 listings = ~100,000 results
   - Estimate: $25-$100 depending on actor pricing
   - Monitor usage at https://console.apify.com/

2. **Rate Limiting:** Workers have 2-second delays between categories to avoid rate limits

3. **Deduplication:** Listings are upserted by URL, so re-running won't create duplicates

4. **Resume:** If interrupted, you can restart - existing listings will be updated, not duplicated

## 📞 Support

- **Apify Console:** https://console.apify.com/
- **MongoDB Compass:** Download to browse your data visually
- **Logs:** All progress shown in terminal with emojis for easy tracking

---

**Ready?** Add your categories to `categories.csv` and run `npm start`! 🚀
