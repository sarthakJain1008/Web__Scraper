# Sample Listing Data Structure

## Complete MongoDB Document Example

This shows the actual structure of one listing as stored in the MongoDB database.

```json
{
  // ===== ETSY LISTING IDENTIFIERS =====
  "listing_id": 1870455200,
  "url": "https://www.etsy.com/listing/1870455200/thai-bl-keychains-bl-ships-bl-merch",
  
  // ===== LISTING DETAILS =====
  "title": "Thai BL Keychains, BL ships, BL merch",
  "price": "5.00",
  "currency_code": "USD",
  
  // ===== SHOP INFORMATION =====
  "shop_name": "RizzerDesigns",
  "shop_id": 38005758,
  "shop_url": "https://www.etsy.com/shop/RizzerDesigns",
  
  // ===== SHOP QUALITY METRICS =====
  "shop_average_rating": 4.9803,
  "shop_total_rating_count": 2554,
  "has_star_seller_signal": true,
  "is_top_rated": false,
  "is_in_merch_library": false,
  
  // ===== SCRAPING METADATA (Our Tags) =====
  "scrapedCountry": "US",
  "scrapedCountryName": "United States",
  "scrapedCategoryName": "keychains",
  "scrapedSearchTerm": "keychains",
  "scrapedCategory": "https://www.etsy.com/c/accessories/keychains",
  "scrapedFacet": "relevance",  // or "most_recent", "high_price", "low_price"
  
  // ===== ANALYSIS TAGS (Our Computed Fields) =====
  "isStarSeller": true,
  "isEtsyPick": false,
  "priceRange": "budget",  // "budget", "low", "medium", "high", "premium"
  "performanceTag": "high",  // "high", "medium", "low"
  
  // ===== ENGAGEMENT METRICS =====
  "views": 12543,
  "num_favorers": 823,
  "listing_age_days": 245,
  
  // ===== SHIPPING INFO =====
  "shipping_type": "free_shipping",
  "free_shipping": true,
  "ships_from_country": "US",
  
  // ===== IMAGE & DESCRIPTION =====
  "image_url": "https://i.etsystatic.com/...",
  "description": "Handmade BL themed keychains...",
  
  // ===== INVENTORY =====
  "quantity": 50,
  "is_customizable": true,
  
  // ===== TIMESTAMPS =====
  "scrapedAt": "2025-11-06T13:20:52.375Z",
  "updatedAt": "2025-11-06T13:20:52.375Z",
  "createdAt": "2025-11-06T13:20:52.375Z",
  
  // ===== ADDITIONAL ETSY DATA =====
  "tags": ["BL", "keychains", "anime", "thai"],
  "materials": ["acrylic", "metal"],
  "processing_min": 1,
  "processing_max": 3,
  "category_path": ["Accessories", "Keychains & Lanyards", "Keychains"],
  
  // MongoDB internal
  "_id": ObjectId("672b3c5c...")
}
```

## Field Categories

### 1. Etsy Original Data
Fields from Etsy API (via Apify):
- `listing_id`, `url`, `title`, `price`
- `shop_name`, `shop_id`, `shop_url`
- `shop_average_rating`, `shop_total_rating_count`
- `has_star_seller_signal`, `is_top_rated`, `is_in_merch_library`
- `views`, `num_favorers`, `quantity`
- `image_url`, `description`, `tags`, `materials`
- `shipping_type`, `free_shipping`, `ships_from_country`

### 2. Scraping Metadata (Our Tags)
Fields we add during scraping:
- `scrapedCountry`: Country code (US, GB, DE, AU, CA)
- `scrapedCountryName`: Full country name
- `scrapedCategoryName`: Category slug (e.g., "keychains")
- `scrapedSearchTerm`: Search query used
- `scrapedCategory`: Full category URL
- `scrapedFacet`: Which sort was used (relevance, most_recent, high_price, low_price)

### 3. Analysis Tags (Computed)
Fields we compute for analysis:
- `isStarSeller`: Boolean (from has_star_seller_signal)
- `isEtsyPick`: Boolean (from is_in_merch_library)
- `priceRange`: String - price bucket classification
  - "budget": < $10
  - "low": $10-50
  - "medium": $50-100
  - "high": $100-500
  - "premium": $500+
- `performanceTag`: String - shop quality tier
  - "high": Star seller or top rated with good metrics
  - "medium": Decent shop rating
  - "low": New or lower rated shops

### 4. Timestamps
- `scrapedAt`: When we scraped this listing
- `updatedAt`: Last update time
- `createdAt`: First time added to DB

## Total Fields in Export

**23 Core Fields** exported to CSV:
1. url
2. title
3. price
4. shop_name
5. shop_id
6. scrapedCountry
7. scrapedCountryName
8. scrapedCategoryName
9. scrapedSearchTerm
10. scrapedFacet
11. isStarSeller
12. isEtsyPick
13. priceRange
14. performanceTag
15. shop_average_rating
16. shop_total_rating_count
17. is_top_rated
18. listing_id
19. views
20. num_favorers
21. shipping_type
22. free_shipping
23. scrapedAt

**MongoDB has 50+ fields** total (including images, descriptions, tags, etc.)

## Usage for Backend

### Quick Filters:
```javascript
// Filter by country
{ scrapedCountry: "US" }

// Filter by category
{ scrapedCategoryName: "keychains" }

// Filter by price range
{ priceRange: "budget" }

// Filter by quality
{ isStarSeller: true }
{ performanceTag: "high" }

// Filter by sort method
{ scrapedFacet: "high_price" }

// Combined filters
{
  scrapedCountry: "GB",
  priceRange: { $in: ["budget", "low"] },
  isStarSeller: true
}
```

### Aggregations:
```javascript
// Group by category
db.listings.aggregate([
  { $group: { _id: "$scrapedCategoryName", count: { $sum: 1 } } }
])

// Average price by country
db.listings.aggregate([
  { $group: { 
      _id: "$scrapedCountry", 
      avgPrice: { $avg: { $toDouble: "$price" } }
  }}
])

// Star seller percentage
db.listings.aggregate([
  { $group: {
      _id: null,
      total: { $sum: 1 },
      starSellers: { $sum: { $cond: ["$isStarSeller", 1, 0] } }
  }}
])
```

## Data Quality

✅ **Deduplication**: Unique index on `url` field
✅ **Country Coverage**: All 5 countries (US, GB, DE, AU, CA)
✅ **Price Diversity**: Budget to Premium ranges
✅ **Quality Mix**: ~38% star sellers
✅ **Sort Diversity**: 4 different sort methods per category

## Current Dataset Size

- **Total Listings**: ~225,000+
- **Categories**: ~226
- **Countries**: 5
- **CSV Export Size**: ~50-60 MB
- **MongoDB Size**: ~200-300 MB (with all fields)
