# Production Run Guide

## ✅ Pre-Flight Checklist

- [x] MongoDB running (`mongodb-community@6.0` confirmed)
- [ ] `.env` configured with production settings
- [x] Apify API token set in `.env`
- [x] `categories.csv` with 335 URLs present
- [x] Code tested and verified

## 📊 Production Specs

### Data Collection
- **Categories**: 335
- **Countries**: 5 (US, GB, DE, AU, CA)
- **Target per country**: 300 listings
- **Expected total**: ~500,000 listings
- **Shop origin**: Filtered by seller location (current implementation)

### API Usage
- **Calls per category**: 20 (4 sorts × 5 countries)
- **Total calls**: 6,700 (335 × 20)
- **Cost**: ~$6.70 ($0.001 per call)
- **Items per call**: 100 (cost-optimized)

### Performance
- **Workers**: 5 concurrent
- **Categories per worker**: 67
- **Estimated time**: 28-56 hours
- **Time per category**: ~5-10 minutes

### Sort Distribution (per country)
- Relevance: 45% (~135 items)
- Most Recent: 25% (~75 items)
- Highest Price: 15% (~45 items)
- Lowest Price: 15% (~45 items)

## 🚀 Run Production

### Option 1: Standard Run
```bash
# Make sure .env is configured
npm start
```

### Option 2: Run in Background (Recommended)
```bash
# Start in background with logs
nohup npm start > scraper.log 2>&1 &

# Get the process ID
echo $! > scraper.pid

# Monitor progress
tail -f scraper.log
```

### Option 3: Run with Screen/Tmux (Best for SSH)
```bash
# Using tmux (recommended)
tmux new -s etsy_scraper
npm start
# Detach: Ctrl+B then D
# Reattach: tmux attach -t etsy_scraper

# OR using screen
screen -S etsy_scraper
npm start
# Detach: Ctrl+A then D
# Reattach: screen -r etsy_scraper
```

## 📈 Monitor Progress

### Check Logs
```bash
# If running in background
tail -f scraper.log

# If running in terminal
# Progress shows in real-time
```

### Query Database
```bash
# Check current status
npm run query

# Or directly
node query-db.js
```

### Sample MongoDB Query
```javascript
// Connect to mongo shell
mongosh

use etsy_scraper_production

// Total count
db.listings.countDocuments()

// By country
db.listings.aggregate([
  { $group: { _id: "$scrapedCountry", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// By category
db.listings.aggregate([
  { $group: { _id: "$scrapedCategoryName", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Progress tracking
db.listings.aggregate([
  { $group: { _id: "$scrapedCategoryName", count: { $sum: 1 } } }
]).itcount()
// Shows how many categories have data
```

## ⚠️ Stop/Pause Run

### Graceful Stop
```bash
# If running in terminal
Ctrl+C

# If running in background
kill $(cat scraper.pid)

# If using tmux/screen
# Reattach and Ctrl+C
```

### Resume After Stop
- MongoDB tracks all scraped data
- Re-running will skip existing URLs (unique index on `url`)
- Only new categories or failed ones will re-scrape

## 🔧 Troubleshooting

### MongoDB Connection Error
```bash
# Check MongoDB status
brew services list | grep mongodb

# Restart if needed
brew services restart mongodb-community@6.0
```

### Apify API Rate Limit
- Scraper has built-in 1.5s delay between calls
- If rate limited, increase delay in `fetchBatch()` function

### Memory Issues
- Reduce `NUM_WORKERS` to 3 or 2 in `.env`
- Restart the process

### Process Killed
- Check available disk space: `df -h`
- Check available memory: `top` or `htop`
- Reduce workers or batch sizes

## 📊 Post-Run Analysis

### Export Data
```bash
# Run query to get statistics
npm run query

# Export sample to JSON
node query-db.js
# Creates sample-output.json
```

### MongoDB Export
```bash
# Export all listings to JSON
mongoexport --db=etsy_scraper_production --collection=listings --out=all_listings.json

# Export to CSV
mongoexport --db=etsy_scraper_production --collection=listings --type=csv --fields=url,title,price,scrapedCountry,scrapedCategoryName --out=listings.csv
```

## 💡 Tips

1. **Run overnight**: 28-56 hours means this is a multi-day run
2. **Use tmux/screen**: Don't rely on keeping terminal open
3. **Monitor periodically**: Check logs every few hours
4. **Backup early**: Once you have ~50K listings, consider a MongoDB backup
5. **Cost tracking**: Monitor Apify dashboard for actual usage

## 🎯 Success Metrics

You'll know it's done when you see:
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
Total execution time: ~100,000s (~28 hours)
============================================================
```

## 📦 Backup MongoDB

```bash
# Backup database
mongodump --db=etsy_scraper_production --out=./backup_$(date +%Y%m%d)

# Restore if needed
mongorestore --db=etsy_scraper_production ./backup_20251104/etsy_scraper_production
```

---

**Ready to start?** Run `npm start` and monitor with `tail -f scraper.log`!
