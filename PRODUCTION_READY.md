# ✅ PRODUCTION READY - Etsy Scraper

## 🎯 Final Configuration

### What it does:
- Scrapes **335 categories** from Etsy
- Collects **~500,000 listings** total
- **5 countries**: US, GB, DE, AU, CA
- **Shop origin filtering**: Only sellers from each respective country
- **~300 listings per country per category**

### Sort Distribution (per country):
- **Relevance**: 45% (~135 items)
- **Most Recent**: 25% (~75 items)  
- **Highest Price**: 15% (~45 items)
- **Lowest Price**: 15% (~45 items)

### Cost & Time:
- **API calls**: 6,700 (4 sorts × 5 countries × 335 categories)
- **Cost**: **$6.70** ($0.001 per call)
- **Time**: **28-56 hours** with 5 concurrent workers
- **Per-shop cap**: Max 10 listings per shop (diversity)

---

## 🚀 HOW TO START PRODUCTION

### Step 1: Update `.env` file

Edit your `.env` and set:

```bash
APIFY_API_TOKEN=your_actual_token
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=etsy_scraper_production
NUM_WORKERS=5
LISTINGS_PER_COUNTRY=300
CSV_FILE_PATH=./categories.csv
TEST_MODE=false
```

### Step 2: Run Production

**Option A - Easy Start (Recommended):**
```bash
./START_PRODUCTION.sh
```

**Option B - Manual Start:**
```bash
npm start
```

**Option C - Background with Logs:**
```bash
nohup npm start > scraper.log 2>&1 &
echo $! > scraper.pid
tail -f scraper.log
```

---

## 📊 MONITORING

### Real-time Progress
```bash
# Follow logs
tail -f scraper.log

# Or if using startup script
tail -f logs/scraper_*.log
```

### Check Database Stats
```bash
npm run query
```

### MongoDB Direct Query
```bash
mongosh

use etsy_scraper_production

// Total scraped
db.listings.countDocuments()

// By country
db.listings.aggregate([
  { $group: { _id: "$scrapedCountry", count: { $sum: 1 } } }
])

// Categories completed
db.listings.distinct("scrapedCategoryName").length
```

---

## ⚠️ CONTROL COMMANDS

### Stop Scraper
```bash
# If using startup script
kill $(cat logs/scraper.pid)

# If running in terminal
Ctrl+C

# Manual kill
ps aux | grep "node.*index.js"
kill <PID>
```

### Resume After Stop
- Just run `npm start` again
- MongoDB prevents duplicates (unique URL index)
- Only incomplete categories will be scraped

---

## 📈 EXPECTED OUTPUT

Console will show:
```
[zipper-charms] 🔍 Multi-country scrape (300 per country × 5 = 1500 total)
[zipper-charms] 💰 Cost: 4 API calls/country × 5 countries = 20 calls @ $0.020
[zipper-charms] 🌍 United States (US)...
   ✓ zipper-charms/US/Relevance: 100 items (requested 120)
   ✓ zipper-charms/US/Recent: 100 items (requested 100)
   ✓ zipper-charms/US/HighPrice: 100 items (requested 100)
   ✓ zipper-charms/US/LowPrice: 100 items (requested 100)
[zipper-charms] ✅ US: 230 listings (target 300)
[zipper-charms]    📊 Rel=95/135, Rec=85/75, Hi$=36/45, Lo$=14/45
[zipper-charms]    ⭐ StarSellers=137, TopRated=28, ShopCap enforced
```

Final summary:
```
============================================================
📈 FINAL SUMMARY
============================================================
✅ Worker 1: 67 categories, ~100,500 listings
✅ Worker 2: 67 categories, ~100,500 listings
✅ Worker 3: 67 categories, ~100,500 listings
✅ Worker 4: 67 categories, ~100,500 listings
✅ Worker 5: 67 categories, ~100,500 listings
============================================================
Total categories processed: 335
Total listings scraped: ~502,500
Successful workers: 5/5
Total execution time: ~28-56 hours
============================================================
```

---

## 💾 BACKUP & EXPORT

### Backup MongoDB
```bash
# Create backup
mongodump --db=etsy_scraper_production --out=./backup_$(date +%Y%m%d)

# Restore backup
mongorestore --db=etsy_scraper_production ./backup_20251104/
```

### Export to JSON
```bash
mongoexport --db=etsy_scraper_production \
  --collection=listings \
  --out=all_listings.json
```

### Export to CSV
```bash
mongoexport --db=etsy_scraper_production \
  --collection=listings \
  --type=csv \
  --fields=url,title,price,scrapedCountry,scrapedCategoryName,isStarSeller,priceRange,performanceTag \
  --out=listings.csv
```

---

## 📊 DATA FIELDS

Each listing includes:
```javascript
{
  // Etsy data
  url, title, price, shop_name, shop_id,
  has_star_seller_signal, is_top_rated,
  shop_average_rating, shop_total_rating_count,
  
  // Scraping metadata
  scrapedCountry: "US|GB|DE|AU|CA",
  scrapedCountryName: "United States",
  scrapedCategory: "https://...",
  scrapedCategoryName: "zipper-charms",
  scrapedFacet: "relevance|most_recent|high_price|low_price",
  
  // Analysis tags
  isStarSeller: boolean,
  priceRange: "budget|low|medium|high|premium",
  performanceTag: "high|medium|low",
  
  // Timestamps
  scrapedAt: Date,
  updatedAt: Date
}
```

---

## 🎯 SUCCESS CRITERIA

✅ **Data Collection**
- 335 categories processed
- ~500,000 listings collected
- ~100,000 per country (US, GB, DE, AU, CA)

✅ **Quality Checks**
- Per-shop cap enforced (max 10 per shop)
- URL deduplication working
- Price range diversity (high/low sorts)
- Sort facet tagging complete

✅ **Cost Efficiency**
- 4 API calls per country
- 100 items per call (maximized)
- Total cost: ~$6.70

---

## 🚨 TROUBLESHOOTING

### MongoDB Connection Error
```bash
brew services restart mongodb-community@6.0
```

### Out of Memory
```bash
# Reduce workers in .env
NUM_WORKERS=3
```

### API Rate Limit
- Built-in 1.5s delay between calls
- If still rate limited, increase in `fetchBatch()` function

### Disk Space
```bash
df -h
# Free up space if needed
```

---

## ✨ YOU'RE READY!

Run:
```bash
./START_PRODUCTION.sh
```

Or:
```bash
npm start
```

Monitor with:
```bash
tail -f scraper.log
npm run query
```

---

**Estimated completion**: 28-56 hours  
**Total cost**: ~$6.70  
**Expected output**: ~500,000 listings across 335 categories and 5 countries

Good luck! 🚀
