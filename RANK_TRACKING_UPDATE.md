# 🎯 Rank & Position Tracking - Now Added!

## ✅ **Solution Implemented**

Your scraper now tracks **search rank** and **page number** for every listing!

---

## 🆕 **New Fields Added**

### 1. **searchRank** (Number)
- Position in search results (1-based)
- Example: `1` = first result, `2` = second result, etc.
- Unique per sort method (relevance, high price, low price, recent)

### 2. **searchPage** (Number)
- Page number where listing appeared
- Calculated based on Etsy's ~48 items per page
- Example: Rank 1-48 = Page 1, Rank 49-96 = Page 2, etc.

---

## 📊 **How It Works**

### Example Data:
```javascript
{
  "title": "Thai BL Keychains",
  "url": "https://etsy.com/listing/123...",
  "scrapedFacet": "relevance",      // Sort method used
  "searchRank": 1,                   // ✅ NEW: 1st result
  "searchPage": 1,                   // ✅ NEW: Page 1
  "scrapedCountry": "US",
  "scrapedCategoryName": "keychains"
}
```

### For Different Sort Methods:
```javascript
// Relevance sort
{
  "scrapedFacet": "relevance",
  "searchRank": 5,     // 5th most relevant result
  "searchPage": 1
}

// High price sort
{
  "scrapedFacet": "high_price",
  "searchRank": 1,     // Most expensive result
  "searchPage": 1
}

// Low price sort
{
  "scrapedFacet": "low_price",
  "searchRank": 3,     // 3rd cheapest result
  "searchPage": 1
}

// Recent sort
{
  "scrapedFacet": "most_recent",
  "searchRank": 10,    // 10th newest result
  "searchPage": 1
}
```

---

## 🎯 **Use Cases**

### 1. **Analyze Top Performers**
```javascript
// Get top 10 most relevant listings per category
db.listings.find({
  scrapedFacet: 'relevance',
  searchRank: { $lte: 10 }
})
```

### 2. **First Page Analysis**
```javascript
// Compare listings on page 1 vs other pages
db.listings.aggregate([
  {
    $group: {
      _id: '$searchPage',
      avgPrice: { $avg: '$price_int' },
      avgRating: { $avg: '$shop_average_rating' },
      count: { $sum: 1 }
    }
  }
])
```

### 3. **Rank by Quality**
```javascript
// See if star sellers rank higher
db.listings.aggregate([
  {
    $group: {
      _id: '$isStarSeller',
      avgRank: { $avg: '$searchRank' }
    }
  }
])
```

### 4. **Price Position Correlation**
```javascript
// Check if rank correlates with price in relevance sort
db.listings.find({
  scrapedFacet: 'relevance',
  searchRank: { $lte: 20 }
}).sort({ searchRank: 1 })
```

---

## 📈 **Updated Field Count**

**Before**: 100 fields  
**After**: **102 fields**

### New Fields:
101. `searchRank` - Position in search results (Number, 1-based)
102. `searchPage` - Page number (Number, 1-based)

---

## ⚠️ **Important Notes**

### 1. **Rank is Per Sort Method**
- A listing can have different ranks for different sorts
- searchRank + scrapedFacet = unique position

### 2. **Existing Data**
- Your **290K existing listings** don't have rank data
- Only **new scrapes** will have searchRank/searchPage

### 3. **Deduplication Effect**
After deduplication and shop cap enforcement:
- searchRank may have gaps (e.g., 1, 2, 4, 7...)
- This is normal - duplicates were removed

### 4. **Page Calculation**
- Based on Etsy's standard 48 items per page
- Formula: `Math.floor((rank - 1) / 48) + 1`

---

## 🔍 **Query Examples**

### Get Top 5 in Each Category
```javascript
db.listings.aggregate([
  {
    $match: {
      scrapedFacet: 'relevance',
      searchRank: { $lte: 5 }
    }
  },
  {
    $group: {
      _id: '$scrapedCategoryName',
      top5: { $push: { title: '$title', rank: '$searchRank', price: '$price' } }
    }
  }
])
```

### Compare First Page vs Rest
```javascript
db.listings.aggregate([
  {
    $project: {
      title: 1,
      price: 1,
      isFirstPage: { $eq: ['$searchPage', 1] }
    }
  },
  {
    $group: {
      _id: '$isFirstPage',
      avgPrice: { $avg: '$price_int' },
      count: { $sum: 1 }
    }
  }
])
```

### Rank Distribution
```javascript
db.listings.aggregate([
  {
    $bucket: {
      groupBy: '$searchRank',
      boundaries: [1, 11, 21, 51, 101],
      default: '100+',
      output: {
        count: { $sum: 1 },
        avgPrice: { $avg: '$price_int' }
      }
    }
  }
])
```

---

## 🚀 **Next Scrape Run**

The next time you run the scraper:
```bash
node index.js
```

All listings will automatically have:
- ✅ `searchRank` field
- ✅ `searchPage` field
- ✅ Database indexes for efficient queries

---

## 📊 **Backfilling Existing Data**

Your 290K existing listings **cannot** be backfilled with accurate rank data because:
- We don't know their original position in search results
- Search results change over time
- It would require re-scraping all categories

**Options**:
1. **Leave as-is** - Only new data has rank ✅ Recommended
2. **Re-scrape categories** - Expensive (~$300) and time-consuming

---

## ✅ **Summary**

| Feature | Before | After |
|---------|--------|-------|
| **Total Fields** | 100 | 102 |
| **Rank Tracking** | ❌ No | ✅ Yes |
| **Page Tracking** | ❌ No | ✅ Yes |
| **Position Analysis** | ❌ No | ✅ Yes |
| **Database Indexes** | 6 | 8 |

**Changes Made**:
1. ✅ Updated `index.js` - Added searchRank & searchPage
2. ✅ Updated `database.js` - Added indexes
3. ✅ New fields automatically saved to MongoDB

**Cost**: $0 (no additional API calls)  
**Backward Compatible**: Yes (existing data unaffected)

---

## 🎉 **You Now Have Full Position Tracking!**

Every future scrape will include:
- Where the listing ranked in search results
- Which page it appeared on
- Perfect for analyzing search performance

Want to test it? Run:
```bash
TEST_MODE=true TEST_CATEGORIES=1 node index.js
```

Then check:
```bash
node query-db.js --fields searchRank,searchPage,scrapedFacet --limit 10
```
