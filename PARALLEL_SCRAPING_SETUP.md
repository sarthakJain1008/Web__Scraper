# 🚀 Parallel Scraping Setup Guide

## 📋 **Overview**

Scrape 290K listings in parallel using 9 API keys:
- **Batch size**: 5 URLs per call
- **Per API**: ~32,300 listings
- **Total calls**: ~58,000 (across all 9 APIs)
- **Cost**: ~$116 total (~$13 per API)
- **Time**: ~4-6 hours (parallel execution)

---

## 🔧 **Step 1: Add API Keys to .env**

Edit your `.env` file and add all 9 API keys:

```bash
# Primary API key
APIFY_API_TOKEN=your_first_api_key_here

# Additional 8 API keys
APIFY_API_TOKEN_2=your_second_api_key_here
APIFY_API_TOKEN_3=your_third_api_key_here
APIFY_API_TOKEN_4=your_fourth_api_key_here
APIFY_API_TOKEN_5=your_fifth_api_key_here
APIFY_API_TOKEN_6=your_sixth_api_key_here
APIFY_API_TOKEN_7=your_seventh_api_key_here
APIFY_API_TOKEN_8=your_eighth_api_key_here
APIFY_API_TOKEN_9=your_ninth_api_key_here
```

---

## 🎯 **Step 2: Verify API Keys Loaded**

Test that all keys are loaded:

```bash
node -e "import('./api-keys.config.js').then(m => console.log('Loaded', m.API_KEYS.length, 'keys'))"
```

Expected output: `Loaded 9 keys`

---

## 🧪 **Step 3: Test Single Worker**

Test one API worker before launching all:

```bash
# Test API Worker 1
API_KEY_INDEX=0 node scrape-parallel-details.js
```

This will start processing the first ~32K listings. Press `Ctrl+C` after 1-2 batches to verify it works.

---

## 🚀 **Step 4: Launch All 9 Workers**

Once testing is successful, launch all workers in parallel:

```bash
# Make script executable
chmod +x start-parallel-scraper.sh

# Launch all 9 workers
./start-parallel-scraper.sh
```

**Output**:
```
🚀 Starting API Worker 1/9...
   ✅ Started with PID: 12345
🚀 Starting API Worker 2/9...
   ✅ Started with PID: 12346
...
✅ All 9 workers started!
```

---

## 📊 **Step 5: Monitor Progress**

### **Check Overall Progress**:
```bash
node check-parallel-progress.js
```

**Sample Output**:
```
📊 PARALLEL SCRAPING PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌍 Overall Progress:
  Total listings: 290,708
  Processed: 125,430 (43.2%)
  With tags: 93,250 (32.1%)
  With description: 118,900 (40.9%)

📋 Progress by API Key:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

API 1:
  ████████████░░░░░░░░ 62.5%
  Processed: 20,188 / 32,300
  With tags: 15,020
  Last update: 2 minutes ago

API 2:
  ███████████░░░░░░░░░ 58.3%
  Processed: 18,832 / 32,300
  ...
```

### **Monitor Individual Worker Logs**:
```bash
# Watch API Worker 1
tail -f logs/api-worker-0.log

# Watch API Worker 2
tail -f logs/api-worker-1.log

# Watch all workers (requires multitail)
multitail logs/api-worker-*.log
```

### **Check Running Workers**:
```bash
ps aux | grep scrape-parallel-details
```

---

## 🔄 **Resume Capability**

### **If a Worker Crashes**:

Each worker tracks which listings it has processed via `detailsScrapedByApi` field.

To resume a specific worker:

```bash
API_KEY_INDEX=0 node scrape-parallel-details.js
```

The script will:
1. Skip already processed listings
2. Continue from where it left off
3. Show "RESUME MODE" message

---

## 🛑 **Stop All Workers**

```bash
pkill -f scrape-parallel-details
```

Or stop individual worker:
```bash
kill <PID>
```

---

## 📊 **Data Structure**

### **New Fields Added to Each Listing**:

```javascript
{
  // Existing fields...
  
  // NEW: Detail scraping fields
  "tags": ["pokemon", "keychain", "gift"],
  "materials": ["Plastic", "Steel"],
  "category_tags": [],
  "description": "Full product description...",
  "who_made": "i_did",
  "when_made": "2020_2024",
  "item_details": [
    { "key": "Primary color", "value": "Blue" }
  ],
  "free_shipping_countries": ["US", "CA"],
  
  // NEW: Tracking fields
  "detailsScrapedAt": ISODate("2025-11-09T08:00:00Z"),
  "detailsScrapedBatch": 145,
  "detailsScrapedByApi": 0,              // Which API (0-8)
  "detailsScrapedApiOffset": 0           // Offset within API's range
}
```

---

## 💡 **Distribution Strategy**

### **Listing Assignment**:

| API Key | Range | Count |
|---------|-------|-------|
| API 1 | 0 - 32,299 | 32,300 |
| API 2 | 32,300 - 64,599 | 32,300 |
| API 3 | 64,600 - 96,899 | 32,300 |
| API 4 | 96,900 - 129,199 | 32,300 |
| API 5 | 129,200 - 161,499 | 32,300 |
| API 6 | 161,500 - 193,799 | 32,300 |
| API 7 | 193,800 - 226,099 | 32,300 |
| API 8 | 226,100 - 258,399 | 32,300 |
| API 9 | 258,400 - 290,707 | 32,308 |

### **Batch Processing**:
- Each API processes 5 URLs per call
- ~6,460 calls per API
- ~58,140 total calls across all APIs

---

## 💰 **Cost Breakdown**

### **Per API Key**:
- Listings: 32,300
- Batches: 6,460 (5 URLs each)
- Calls: 6,460
- Cost: 6,460 × $0.02 = **$129.20**

### **Total (9 APIs)**:
- Listings: 290,708
- Batches: 58,142
- Calls: 58,142
- Cost: 58,142 × $0.02 = **$1,162.84**

⚠️ **Note**: This is higher than expected because we're using 5-URL batches instead of 100-URL batches.

### **Cost Optimization**:
If cost is a concern, consider:
1. **Priority listings only** (top 100K) → $388
2. **Larger batches** (10-20 URLs) → $580
3. **Sequential processing** (1 API) → $1,163 but slower

---

## ⏱️ **Time Estimates**

### **Per API (Sequential)**:
- Batches: 6,460
- Time per batch: ~30 seconds
- Total: ~54 hours per API

### **All APIs (Parallel)**:
- Time: ~6 hours (9x parallelization)
- Actual: May be faster if APIs finish at different rates

---

## 🔍 **Verification After Completion**

### **Check Completion**:

```bash
node check-parallel-progress.js
```

Should show 100% completion for all APIs.

### **Verify Data Quality**:

```bash
node -e '
import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017");
await client.connect();
const db = client.db("etsy_scraper");

const stats = await db.collection("listings").aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      withTags: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ["$tags", []] } }, 0] }, 1, 0] } },
      withDesc: { $sum: { $cond: [{ $ne: ["$description", null] }, 1, 0] } }
    }
  }
]).toArray();

console.log("Total:", stats[0].total);
console.log("With tags:", stats[0].withTags, "(" + (stats[0].withTags/stats[0].total*100).toFixed(1) + "%)");
console.log("With description:", stats[0].withDesc, "(" + (stats[0].withDesc/stats[0].total*100).toFixed(1) + "%)");

await client.close();
'
```

---

## 🚨 **Troubleshooting**

### **Problem: Worker not starting**
```bash
# Check if API key is loaded
node -e "console.log(process.env.APIFY_API_TOKEN)"

# Check logs
cat logs/api-worker-0.log
```

### **Problem: Worker crashed**
```bash
# Check error in logs
tail -100 logs/api-worker-0.log

# Resume from where it stopped
API_KEY_INDEX=0 node scrape-parallel-details.js
```

### **Problem: Slow progress**
```bash
# Check MongoDB performance
mongosh --eval "db.currentOp()"

# Check system resources
htop
```

### **Problem: Rate limiting**
```bash
# Increase delay between calls
# Edit scrape-parallel-details.js:
# const DELAY_BETWEEN_CALLS = 3000; // Increase from 2000 to 3000
```

---

## 📋 **Quick Reference**

### **Start**:
```bash
./start-parallel-scraper.sh
```

### **Monitor**:
```bash
node check-parallel-progress.js
tail -f logs/api-worker-0.log
```

### **Stop**:
```bash
pkill -f scrape-parallel-details
```

### **Resume**:
```bash
API_KEY_INDEX=0 node scrape-parallel-details.js
```

---

## ✅ **Expected Final Dataset**

After completion:

| Field | Coverage |
|-------|----------|
| **Total Listings** | 290,708 (100%) |
| **With Tags** | ~215,000 (74%) |
| **With Materials** | ~180,000 (62%) |
| **With Description** | ~280,000 (96%) |
| **With Item Details** | ~270,000 (93%) |

---

## 🎯 **Ready to Launch?**

1. ✅ Add all 9 API keys to `.env`
2. ✅ Test one worker: `API_KEY_INDEX=0 node scrape-parallel-details.js`
3. ✅ Launch all: `./start-parallel-scraper.sh`
4. ✅ Monitor: `node check-parallel-progress.js`

**Let's start scraping!** 🚀
