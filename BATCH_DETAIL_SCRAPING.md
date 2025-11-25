# 🔍 Batch Detail Scraping Strategy

## 📊 **Overview**

Scrape detailed data for all **290,708 listings** using batch processing:
- **Input**: 100 listing URLs per API call
- **Output**: Detailed data for each listing
- **Total calls**: ~2,900
- **Cost**: ~$58
- **Time**: ~16 hours

---

## 🎯 **What This Gets You**

### **NEW Fields from Batch Detail Scraping**:

1. **tags** (Array) - Product keywords/SEO tags
2. **materials** (Array) - Materials used
3. **category_tags** (Array) - Category-specific tags
4. **description** (string) - Full product description
5. **who_made** (string) - Who made it (e.g., "i_did", "collective")
6. **when_made** (string) - When made (e.g., "2020_2024", "made_to_order")
7. **item_details** (Array) - Detailed item attributes
8. **free_shipping_countries** (Array) - Countries with free shipping
9. **free_shipping_data** (object) - Shipping details
10. **Enhanced bestseller flags** (booleans)

---

## 📈 **Comparison with Previous Approaches**

### **Approach 1: Category Scraping (Current)**
- Input: 1 category URL
- Output: 100 listings (basic data)
- Fields: 60
- Cost: $0.02 per category
- ❌ No tags, no materials, no description

### **Approach 2: Individual Detail Scraping**
- Input: 1 listing URL
- Output: 1 listing (detailed data)
- Fields: 65
- Cost: $0.001 per listing
- ✅ Has tags, materials
- ❌ SLOW (290K calls = 121 hours)

### **Approach 3: Batch Detail Scraping** ⭐ **NEW**
- Input: 100 listing URLs
- Output: 100 listings (detailed data)
- Fields: 70+
- Cost: $0.02 per batch (= $0.0002 per listing)
- ✅ Has tags, materials, description
- ✅ FAST (2,900 calls = 16 hours)
- ✅ **5x cheaper than individual!**

---

## 💰 **Cost Analysis**

### **Full Dataset (290K listings)**:

| Method | Calls | Cost/Call | Total Cost | Time |
|--------|-------|-----------|------------|------|
| Individual | 290,000 | $0.001 | **$290** | 121 hrs |
| Batch (100) | 2,900 | $0.02 | **$58** | 16 hrs |
| **Savings** | - | - | **$232** | 105 hrs |

---

## 🚀 **How to Use**

### **1. Test Mode (10 batches = 1,000 listings)**

```bash
TEST_MODE=true TEST_LIMIT=10 node scrape-all-listings-details.js
```

**Test Output**:
- Processes: 1,000 listings
- Cost: ~$0.20
- Time: ~5 minutes

### **2. Production Mode (All 290K listings)**

```bash
node scrape-all-listings-details.js
```

**Production Output**:
- Processes: 290,708 listings
- Cost: ~$58
- Time: ~16 hours

---

## 📊 **Script Features**

### ✅ **Built-in Safety**:
- Automatic retries (3 attempts)
- Rate limiting (2s delay between calls)
- Progress tracking
- Error handling
- Test mode for validation

### ✅ **Database Integration**:
- Updates existing listings
- Adds detailed fields
- Tracks batch number
- Timestamps updates

### ✅ **Monitoring**:
- Real-time progress
- Success/error counts
- Cost tracking
- Sample output

---

## 📋 **Data Fields Added**

### **Content Fields**:
```javascript
{
  "tags": ["pokemon", "keychain", "gift"],
  "materials": ["Plastic", "Steel"],
  "category_tags": ["collectibles"],
  "description": "Full product description text...",
  "who_made": "i_did",
  "when_made": "2020_2024"
}
```

### **Shipping Fields**:
```javascript
{
  "free_shipping_countries": ["US", "CA"],
  "free_shipping_data": {
    "is_free_shipping": true,
    "min_order_amount": null
  }
}
```

### **Item Details**:
```javascript
{
  "item_details": [
    { "key": "Primary color", "value": "Blue" },
    { "key": "Style", "value": "Minimalist" }
  ]
}
```

### **Metadata**:
```javascript
{
  "detailsScrapedAt": "2025-11-08T16:00:00Z",
  "detailsScrapedBatch": 145
}
```

---

## 🔍 **Verification After Scraping**

### **Check Updated Listings**:

```bash
node -e '
const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");

client.connect().then(async () => {
  const db = client.db("etsy_scraper");
  
  const withTags = await db.collection("listings").countDocuments({
    tags: { $exists: true, $ne: [] }
  });
  
  const withDescription = await db.collection("listings").countDocuments({
    description: { $exists: true, $ne: null }
  });
  
  console.log("Listings with tags:", withTags);
  console.log("Listings with description:", withDescription);
  
  const sample = await db.collection("listings")
    .findOne({ detailsScrapedBatch: { $exists: true } });
  
  console.log("\nSample listing:");
  console.log("  Title:", sample.title.substring(0, 50));
  console.log("  Tags:", sample.tags?.length || 0);
  console.log("  Materials:", sample.materials?.length || 0);
  console.log("  Description length:", sample.description?.length || 0);
  
  client.close();
});
'
```

---

## ⚠️ **Important Notes**

### **Actor Input Format**:

The script assumes `jupri/etsy-scraper` accepts multiple URLs like:

```javascript
{
  query: "https://etsy.com/listing/123\nhttps://etsy.com/listing/456\n...",
  limit: 100
}
```

### **If Actor Doesn't Support Batch URLs**:

We have 2 fallback options:

**Option A**: Use smaller batches (10-20 URLs)
- More API calls but safer
- Cost: ~$100-150
- Time: ~24 hours

**Option B**: Keep individual scraping
- Use existing `scrape-priority-details.js`
- Run in parallel (5-10 workers)
- Cost: $290
- Time: ~24 hours (parallelized)

---

## 📝 **Script Structure**

```javascript
// 1. Fetch all listing URLs from MongoDB
const allListings = await collection
  .find({}, { projection: { url: 1 } })
  .toArray();

// 2. Split into batches of 100
const batches = chunk(allListings, 100);

// 3. For each batch:
for (const batch of batches) {
  // Call actor with 100 URLs
  const result = await actor.call({
    query: batch.map(l => l.url).join('\n'),
    limit: 100
  });
  
  // Update database with results
  for (const item of result.items) {
    await collection.updateOne(
      { listing_id: item.listing.listing_id },
      { $set: extractedFields }
    );
  }
}
```

---

## 🎯 **Recommended Workflow**

### **Phase 1: Test (Today)**
```bash
TEST_MODE=true TEST_LIMIT=10 node scrape-all-listings-details.js
```
- Verify data quality
- Check all fields
- Confirm batch processing works

### **Phase 2: Small Batch (Today)**
```bash
TEST_MODE=true TEST_LIMIT=100 node scrape-all-listings-details.js
```
- Process 10,000 listings
- Cost: ~$2
- Validate at scale

### **Phase 3: Full Run (Overnight)**
```bash
node scrape-all-listings-details.js
```
- Process all 290K listings
- Cost: ~$58
- Time: ~16 hours
- Run overnight

---

## 📊 **Expected Final Dataset**

After completion, you'll have:

| Field Category | Count | Coverage |
|----------------|-------|----------|
| **Total Listings** | 290,708 | 100% |
| **With Tags** | ~215,000 | ~74% |
| **With Materials** | ~180,000 | ~62% |
| **With Description** | ~280,000 | ~96% |
| **With Item Details** | ~270,000 | ~93% |

---

## ✅ **Advantages of This Approach**

1. **5x Cheaper** than individual scraping ($58 vs $290)
2. **8x Faster** than individual scraping (16h vs 121h)
3. **Complete Data** - All detailed fields
4. **Efficient** - Maximizes Apify actor capabilities
5. **Trackable** - Batch numbers for debugging
6. **Resumable** - Can restart from any batch
7. **Safe** - Test mode for validation

---

## 🚀 **Next Steps**

1. **Test the script**:
   ```bash
   TEST_MODE=true TEST_LIMIT=10 node scrape-all-listings-details.js
   ```

2. **Verify data quality**:
   ```bash
   node query-db.js --fields tags,materials,description --limit 5
   ```

3. **Run full scrape** (if test passes):
   ```bash
   nohup node scrape-all-listings-details.js > batch-scrape.log 2>&1 &
   ```

4. **Monitor progress**:
   ```bash
   tail -f batch-scrape.log
   ```

---

## 💡 **Pro Tips**

1. **Run overnight** - 16 hours is perfect for an overnight job
2. **Monitor first 100 batches** - Ensure no errors
3. **Check database growth** - Watch MongoDB size
4. **Save logs** - Use `nohup` to keep logs
5. **Backup before** - Backup MongoDB before full run

---

**Ready to run? Start with test mode!** 🚀
