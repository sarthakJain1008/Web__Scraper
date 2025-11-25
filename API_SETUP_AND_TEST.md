# 🚀 API Setup and Test Run Guide

## 📋 **Step 1: Add Your 7 API Keys**

Edit your `.env` file and add all 7 API keys:

```bash
# API Key 1 (your existing key)
APIFY_API_TOKEN=your_existing_key_here

# API Keys 2-5 (from your list)
APIFY_API_TOKEN_2=[your_api_key_here]
APIFY_API_TOKEN_3=[your_api_key_here]
APIFY_API_TOKEN_4=[your_api_key_here]
APIFY_API_TOKEN_5=[your_api_key_here]

# API Keys 6-7 (add if you have more)
APIFY_API_TOKEN_6=your_sixth_key_here
APIFY_API_TOKEN_7=your_seventh_key_here
```

---

## ✅ **Step 2: Verify API Keys Loaded**

Run this command to check:

```bash
node -e "import('./api-keys.config.js').then(m => console.log('✅ Loaded', m.API_KEYS.length, 'API keys'))"
```

**Expected output**: `✅ Loaded 7 API keys`

---

## 🧪 **Step 3: Run Test (100 Listings)**

Test all 7 APIs in parallel with 100 listings:

```bash
node test-parallel-100.js
```

### **What This Does**:
- Selects 100 listings from your database
- Distributes them across 7 APIs (~14 per API)
- Runs all 7 workers in parallel
- Tracks time, success rate, and effectiveness
- Shows extrapolation for full dataset

### **Expected Output**:

```
🧪 PARALLEL SCRAPER TEST - 100 LISTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APIs: 7
Total listings: 100
Per API: ~15
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Selected 100 listings for testing

📦 Distribution:
  API 1: 15 listings
  API 2: 15 listings
  API 3: 14 listings
  API 4: 14 listings
  API 5: 14 listings
  API 6: 14 listings
  API 7: 14 listings

🚀 Starting all workers...

[API 1] Starting test with 15 listings...
[API 2] Starting test with 15 listings...
[API 3] Starting test with 14 listings...
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TEST COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Results by API:

API 1:
  Updated: 15/15
  With tags: 11
  Batches: 3
  Time: 45.3s
  Success: 100.0%

API 2:
  Updated: 15/15
  With tags: 12
  Batches: 3
  Time: 47.1s
  Success: 100.0%

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 Overall Statistics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total updated: 98/100 (98.0%)
With tags: 73 (74.5%)
Total batches: 20
Total time: 48.5s
Avg time per API: 6.9s
Processing rate: 2.0 listings/sec

🎯 Effectiveness:
  Success rate: 98.0%
  Tag coverage: 74.5%
  Parallel speedup: 7.0x

💡 Extrapolation for Full Dataset (290,708 listings):
  Estimated time: 40.3 hours
  Estimated cost: $1,162.83
  Per API: 5.8 hours, $166.12

🔍 Sample updated listings:

1. Thai BL Keychains, BL ships, BL merch
   Tags (12): Thai BL, Thai BL ship, Thai BL keychains, Thai BL merch, geminifourth
   Materials: none
   Description: Show your love for Thai BL series with these collectible keychains...

2. Pokemon Keychain: Collectible Character Keyring
   Tags (13): pokemon, pokemon keychain, bulbasaur, Pokemon Figurines, charmander
   Materials: Plastic
   Description: High-quality 3D printed Pokemon keychains featuring your favorite...

✅ Test successful! Ready for full run.
```

---

## 📊 **What the Test Shows**

### **1. Time Metrics**:
- **Total time**: How long 100 listings took (parallel)
- **Avg time per API**: Time each API took
- **Processing rate**: Listings processed per second
- **Parallel speedup**: How much faster parallel is vs sequential

### **2. Success Metrics**:
- **Success rate**: % of listings successfully updated
- **Tag coverage**: % of listings that have tags
- **Batches**: Number of API calls made

### **3. Extrapolation**:
- **Estimated time**: For all 290K listings
- **Estimated cost**: Total cost for full run
- **Per API breakdown**: Time and cost per API key

---

## 🎯 **Interpreting Results**

### **Good Results**:
- ✅ Success rate: >90%
- ✅ Tag coverage: >70%
- ✅ Processing rate: >1 listing/sec
- ✅ Parallel speedup: ~7x

### **If Results Are Low**:
- ⚠️ Success rate <80%: Check API keys, network
- ⚠️ Tag coverage <50%: Expected, some listings don't have tags
- ⚠️ Processing rate <0.5: Increase DELAY_BETWEEN_CALLS

---

## 🚀 **Step 4: Launch Full Scraper** (After successful test)

Once test passes, launch full production run:

```bash
./start-parallel-scraper.sh
```

This will start all 7 workers processing 290K listings.

---

## 📊 **Monitor During Full Run**

```bash
# Check overall progress
node check-parallel-progress.js

# Watch specific API worker
tail -f logs/api-worker-0.log

# Check all running workers
ps aux | grep scrape-parallel-details
```

---

## 🛑 **Stop Test or Full Run**

```bash
# Stop all workers
pkill -f scrape-parallel-details

# Or Ctrl+C in terminal if running test
```

---

## 💾 **Test Data Cleanup** (Optional)

If you want to re-run the test on the same listings:

```bash
node -e '
import { MongoClient } from "mongodb";
const client = new MongoClient("mongodb://localhost:27017");
await client.connect();
const db = client.db("etsy_scraper");
await db.collection("listings").updateMany(
  { testRun: true },
  { $unset: { testRun: "", detailsScrapedByApi: "", detailsScrapedAt: "" } }
);
console.log("✅ Test data cleaned");
await client.close();
'
```

---

## 🔧 **Configuration**

### **Current Settings**:
- **Batch size**: 5 URLs per API call
- **APIs**: 7 keys
- **Listings per API**: 41,530
- **Delay**: 2 seconds between calls

### **To Adjust**:

Edit `scrape-parallel-details.js`:
```javascript
const BATCH_SIZE = 5;           // Change to 10 for larger batches
const DELAY_BETWEEN_CALLS = 2000; // Increase to 3000 for slower rate
```

---

## ✅ **Summary**

1. ✅ Add 7 API keys to `.env`
2. ✅ Verify keys loaded: `node -e "import..."`
3. ✅ Run test: `node test-parallel-100.js`
4. ✅ Review test results (time, success rate, extrapolation)
5. ✅ If good, launch full: `./start-parallel-scraper.sh`
6. ✅ Monitor: `node check-parallel-progress.js`

---

## 📝 **Expected Test Results**

### **Time**:
- 100 listings in ~45-60 seconds (parallel)
- ~0.5-0.6 seconds per listing
- Parallel speedup: ~7x

### **Effectiveness**:
- Success rate: 90-100%
- Tag coverage: 70-75%
- Cost: ~$0.40 for test

### **Full Run Estimates**:
- Time: ~40 hours (parallel across 7 APIs)
- Cost: ~$1,163
- Per API: ~5.7 hours, ~$166

**Ready to test!** 🚀
