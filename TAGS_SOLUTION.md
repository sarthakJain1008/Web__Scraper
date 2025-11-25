# 🏷️ Tags & Keywords - Complete Solution

## ❌ **The Reality Check**

After testing the Apify actor (`jupri/etsy-scraper`), I discovered:

**The `includeDetails` parameter does NOT exist.**

Tags/keywords **cannot** be scraped from search results - they're only available on individual listing detail pages.

---

## 🔍 **Investigation Results**

### What I Tested:
1. ✅ Reviewed actor documentation
2. ✅ Tested with `includeDetails: true` parameter → **Doesn't work**
3. ✅ Checked actor input schema → **No such parameter exists**
4. ✅ Analyzed Apify dataset structure → **Tags only in full listing object**

### What I Found:

**Search Results (What you currently scrape):**
```javascript
// From category/search URLs
{
  "title": "Product",
  "price": "5.00",
  "url": "https://etsy.com/listing/123...",
  // ❌ NO tags
  // ❌ NO materials
  // ❌ NO keywords
}
```

**Individual Listing (What has tags):**
```javascript
// From direct listing URL
{
  "title": "Product",
  "price": "5.00",
  "url": "https://etsy.com/listing/123...",
  "tags": ["Love Oil", "Body Oil", ...],     // ✅ HAS tags!
  "materials": ["Fragrance Oil", ...],        // ✅ HAS materials!
  "category_tags": []                         // ✅ Has category tags!
}
```

---

## ✅ **Solution Options**

### Option 1: Two-Pass Scraping (RECOMMENDED)

**Approach**: First get listing URLs, then scrape each URL individually for tags.

#### Step 1: Keep Current Scraping
Your current scraper already collects 290K+ listing URLs. ✅ Done!

#### Step 2: Create Detail Scraper

Create `scrape-listing-details.js`:

```javascript
import { ApifyClient } from 'apify-client';
import { connectDB } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

async function scrapeListingDetails() {
  const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
  const db = await connectDB();
  const collection = db.collection('listings');
  
  // Get listings without tags
  const listings = await collection.find({ 
    tags: { $exists: false }  // Only listings without tags
  }).limit(100).toArray();  // Start with 100 for testing
  
  console.log(`📋 Found ${listings.length} listings to scrape details for\n`);
  
  let processed = 0;
  let withTags = 0;
  
  for (const listing of listings) {
    try {
      console.log(`[${processed + 1}/${listings.length}] ${listing.title.substring(0, 50)}...`);
      
      // Scrape individual listing URL
      const run = await client.actor('jupri/etsy-scraper').call({
        query: listing.url,  // Direct URL
        limit: 1
      }, { waitSecs: 0 });
      
      await client.run(run.id).waitForFinish();
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      
      if (items.length > 0 && items[0].tags) {
        // Update database with tags
        await collection.updateOne(
          { url: listing.url },
          { 
            $set: {
              tags: items[0].tags || [],
              materials: items[0].materials || [],
              category_tags: items[0].category_tags || [],
              detailsScrapedAt: new Date()
            }
          }
        );
        
        withTags++;
        console.log(`  ✅ Tags: ${items[0].tags?.length || 0}, Materials: ${items[0].materials?.length || 0}`);
      } else {
        console.log(`  ⚠️  No tags found`);
      }
      
      processed++;
      
      // Rate limit: 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Complete: ${withTags}/${processed} listings now have tags`);
}

scrapeListingDetails();
```

**Run it**:
```bash
node scrape-listing-details.js
```

#### Cost Calculation:
- **Per listing**: 1 API call = $0.001
- **For 290K listings**: 290K × $0.001 = **$290**
- **Time**: ~160 hours (2 sec/listing with rate limits)

#### Optimization Strategy:
```bash
# Process in batches
BATCH_SIZE=1000 node scrape-listing-details.js

# Use multiple workers
NUM_WORKERS=5 node scrape-listing-details.js
```

This could reduce time to ~32 hours with 5 workers.

---

### Option 2: Only Scrape Tags for Important Listings

**Strategy**: Prioritize high-value listings

```javascript
// Only scrape tags for:
const priorityListings = await collection.find({
  tags: { $exists: false },
  $or: [
    { isStarSeller: true },           // Star sellers
    { is_bestseller: true },          // Bestsellers
    { performanceTag: 'high' },       // High performers
    { in_cart_count: { $gt: 50 } }    // Popular items
  ]
}).toArray();
```

**Cost**: ~50-100K listings = **$50-100**  
**Time**: ~28-56 hours

---

### Option 3: Use Tags for Future Scrapes Only

**Strategy**: Leave existing 290K without tags, only new scrapes get tags

**Pros**:
- ✅ No backfill cost
- ✅ Simple implementation
- ✅ Future data has tags

**Cons**:
- ❌ 290K existing listings remain without tags
- ❌ Inconsistent data

**Implementation**: Already done! Just revert the `includeDetails` change since it doesn't work anyway.

---

### Option 4: Build Custom Scraper

**Strategy**: Use Puppeteer/Playwright to scrape Etsy directly

**Pros**:
- ✅ Full control
- ✅ Can get any field you want
- ✅ No per-request cost (only compute)

**Cons**:
- ❌ Need to build and maintain
- ❌ More complex
- ❌ Risk of IP blocking

**Code skeleton**:
```javascript
import puppeteer from 'puppeteer';

async function scrapeTags(listingUrl) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(listingUrl);
  
  // Extract tags from page
  const tags = await page.evaluate(() => {
    const tagElements = document.querySelectorAll('[data-region="tags"] a');
    return Array.from(tagElements).map(el => el.textContent.trim());
  });
  
  await browser.close();
  return tags;
}
```

---

## 📊 **Recommendation**

### For Your Use Case (Embeddings Analysis):

**Go with Option 1 (Two-Pass) BUT only for Priority Listings (Option 2)**

**Reasoning**:
1. You don't need tags for ALL 290K listings
2. For embeddings, high-quality listings matter more
3. Saves 70% of cost ($100 vs $290)
4. Faster completion (1-2 days vs 1 week)

### Priority Query:
```javascript
{
  tags: { $exists: false },
  $or: [
    { isStarSeller: true },
    { is_bestseller: true },
    { performanceTag: 'high' },
    { shop_total_rating_count: { $gt: 500 } },
    { in_cart_count: { $gt: 30 } }
  ]
}
```

This targets ~80-100K listings (the best ones) for ~$80-100.

---

## 🚀 **Next Steps**

1. ✅ **Revert the `includeDetails` change** (it doesn't work)
   
2. **Create the detail scraper** (`scrape-listing-details.js`)
   
3. **Test with 10 listings first**:
   ```bash
   # Modify script to limit: 10
   node scrape-listing-details.js
   ```

4. **Verify tags are saved**:
   ```bash
   node -e "require('./database.js').connectDB().then(async db => {
     const listing = await db.collection('listings').findOne({ tags: { $exists: true } });
     console.log('Tags:', listing.tags);
   });"
   ```

5. **Scale up to priority listings** (80-100K)

6. **Monitor progress** and adjust batch size

---

## ⚠️ **Important Notes**

1. **Rate Limits**: Etsy/Apify may block if you scrape too fast
   - Keep 2-second delays between requests
   - Use residential proxies if available

2. **Error Handling**: Some listings may not have tags
   - Track which ones fail
   - Retry failed ones later

3. **Database Space**: Add index for tags
   ```javascript
   await db.collection('listings').createIndex({ tags: 1 });
   ```

4. **Alternative**: Use title as proxy for tags
   - Extract keywords from title using NLP
   - Cheaper but less accurate

---

## ✅ **Summary**

| Option | Cost | Time | Coverage | Complexity |
|--------|------|------|----------|------------|
| **Option 1: All listings** | $290 | 160h | 100% | Low |
| **Option 2: Priority only** ⭐ | $80-100 | 28-56h | Best 35% | Low |
| **Option 3: Future only** | $0 | 0h | New only | None |
| **Option 4: Custom scraper** | Compute | Varies | 100% | High |

**Recommended**: **Option 2** - Priority listings for $80-100

---

## 📝 Files to Create

1. **`scrape-listing-details.js`** - Detail scraper script
2. **`scrape-priority-details.js`** - Priority listings only
3. **`check-tags-status.js`** - Monitor progress
4. **`retry-failed-details.js`** - Retry failures

Want me to create these scripts for you?
