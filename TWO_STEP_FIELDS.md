# 🔍 Two-Step Approach: Complete Field List

## 📊 **Overview**

With the **two-step scraping approach**, you get:

- **Step 1 (Search Results)**: 60 base fields from category/search scraping
- **Step 2 (Detail Scraping)**: +5 critical fields (tags, materials, etc.)
- **Total**: **65 fields** per listing

---

## 🆕 **NEW Fields from Two-Step Approach**

These fields are **ONLY** available when you scrape listing detail pages (Step 2):

### 1. **tags** (Array)
- **Seller-defined product keywords/tags**
- Average: 12.6 tags per listing
- Range: 5-13 tags
- **Example**: `["pokemon", "pokemon keychain", "bulbasaur", "charmander", "gift for him"]`
- **Use**: SEO, product discovery, embeddings, similarity matching

### 2. **materials** (Array)
- **Materials used in the product**
- Example: `["Leather", "Cowhide"]`, `["Stainless steel"]`, `["Plastic resin"]`
- **Use**: Material filtering, product categorization

### 3. **category_tags** (Array)
- **Category-specific tags** (often empty)
- Example: `[]` or `["home-decor", "wall-art"]`

### 4. **detailsScrapedAt** (Date)
- **Timestamp** of when detail scraping occurred
- Example: `2025-11-07T09:34:52.798Z`
- **Use**: Track freshness of tag data

### 5. **Additional bestseller flags** (Booleans)
- `has_star_seller_signal`
- `is_bestseller`
- `is_bestseller_by_fixed_qty_category_l3`
- `is_bestseller_by_fixed_qty_category_leaf`
- `is_made_to_order`
- `is_top_rated`

---

## 📋 **Complete Field List (65 Total)**

### **🏷️ Product Identification** (5 fields)
1. `listing_id` (number) - Unique Etsy listing ID
2. `title` (string) - Product title
3. `url` (string) - Full Etsy listing URL
4. `state` (string) - Listing state (active, sold out, etc.)
5. `seller_taxonomy_id` (number) - Etsy's taxonomy ID

---

### **💰 Pricing Information** (7 fields)
6. `price` (string) - Display price (e.g., "$5.00")
7. `price_int` (number) - Price in cents (e.g., 500)
8. `price_formatted_short` (string) - Short formatted price
9. `price_unformatted` (string) - Raw price string
10. `priceRange` (string) - Our categorization (budget/low/medium/high/premium)
11. `currency_code` (string) - Currency code (e.g., "USD")
12. `currency_symbol` (string) - Currency symbol (e.g., "$")
13. `lowest_purchasable_price` (object) - Lowest price if variations exist
14. `country_specific_pricing` (object) - Regional pricing info

---

### **🏪 Shop/Seller Information** (8 fields)
14. `Shop` (object) - Complete shop info object
15. `shop_id` (number) - Unique shop ID
16. `shop_name` (string) - Shop name
17. `shop_url` (string) - Shop URL
18. `shop_average_rating` (string) - Average rating (e.g., "4.9")
19. `shop_total_rating_count` (string) - Total reviews (e.g., "1250")
20. `isStarSeller` (boolean) - Star Seller badge
21. `has_star_seller_signal` (boolean) - Star Seller signal ✅ NEW

---

### **🎨 Product Images** (3 fields)
22. `img` (object) - Main image object with URLs
23. `listing_images` (Array) - Array of image objects
24. `listing_image_count` (number) - Number of images

---

### **⭐ Performance & Quality** (9 fields)
25. `in_cart_count` (number) - How many people have in cart
26. `listing_review_photo_count` (number) - Reviews with photos
27. `isEtsyPick` (boolean) - Etsy's Pick badge
28. `performanceTag` (string) - Our performance tag (high/medium/low)
29. `is_bestseller` (boolean) - Bestseller flag ✅ NEW
30. `is_bestseller_by_fixed_qty_category_l3` (boolean) ✅ NEW
31. `is_bestseller_by_fixed_qty_category_leaf` (boolean) ✅ NEW
32. `is_top_rated` (boolean) - Top rated flag ✅ NEW
33. `has_star_seller_signal` (boolean) ✅ NEW

---

### **🏷️ Tags & Keywords** (3 fields) ✅ NEW FROM STEP 2
34. **`tags`** (Array) - Seller-defined product tags/keywords ✅ **PRIMARY VALUE**
35. **`materials`** (Array) - Materials used in product ✅ **NEW**
36. **`category_tags`** (Array) - Category-specific tags ✅ **NEW**

---

### **📦 Inventory & Production** (6 fields)
37. `quantity` (number) - Available quantity
38. `min_processing_days` (number) - Min days to ship
39. `max_processing_days` (number) - Max days to ship
40. `is_made_to_order` (boolean) - Made to order flag ✅ NEW
41. `is_handmade` (boolean) - Handmade flag
42. `is_retail` (boolean) - Retail item flag

---

### **📍 Location & Shipping** (5 fields)
43. `origin_country_id` (number) - Origin country ID
44. `origin_postal_code` (string) - Postal code
45. `ships_to_regions` (Array) - Regions shipped to
46. `accepts_gift_card` (boolean) - Accepts gift cards
47. `logging` (object) - Shipping/logistics info

---

### **📅 Dates & Timestamps** (6 fields)
48. `create_date` (number) - Listing creation timestamp
49. `original_create_date` (number) - Original creation date
50. `last_sale_date` (number) - Last sale timestamp
51. `createdAt` (Date) - When added to our DB
52. `updatedAt` (Date) - Last updated in our DB
53. **`detailsScrapedAt`** (Date) - When details were scraped ✅ NEW

---

### **🎯 Scraping Metadata** (8 fields)
54. `scrapedAt` (Date) - When initially scraped
55. `scrapedCategory` (string) - Category URL
56. `scrapedCategoryName` (string) - Category name
57. `scrapedCountry` (string) - Country code (US/GB/CA/etc.)
58. `scrapedCountryName` (string) - Country name
59. `scrapedFacet` (string) - Sort method (relevance/high_price/etc.)
60. `scrapedSearchTerm` (string) - Search term used
61. `subcategory` (string) - Subcategory URL

---

### **🔍 Product Attributes** (5 fields)
62. `has_variations` (boolean) - Has product variations
63. `is_surfaceable` (boolean) - Visible in search
64. `for_pattern_consumption` (boolean) - Pattern listing
65. `for_public_consumption` (boolean) - Public listing

---

## 📊 **Field Type Breakdown**

| Type | Count | Examples |
|------|-------|----------|
| **String** | 22 | title, url, shop_name, price |
| **Number** | 15 | price_int, listing_id, in_cart_count |
| **Boolean** | 15 | isStarSeller, is_handmade, is_bestseller |
| **Object** | 5 | Shop, img, logging, lowest_purchasable_price |
| **Array** | 5 | **tags**, **materials**, listing_images, ships_to_regions |
| **Date** | 3 | createdAt, updatedAt, **detailsScrapedAt** |

---

## 🎯 **Most Valuable Fields for Analysis**

### **Top 10 Essential Fields**:

1. **`tags`** ✅ NEW - Product keywords/SEO tags
2. **`title`** - Product name
3. **`price_int`** - Price for sorting/filtering
4. **`shop_name`** - Seller identification
5. **`shop_average_rating`** - Quality indicator
6. **`in_cart_count`** - Popularity metric
7. **`isStarSeller`** - Trust indicator
8. **`performanceTag`** - Performance category
9. **`scrapedCategoryName`** - Product category
10. **`materials`** ✅ NEW - Material composition

---

## 💡 **Use Cases by Field Group**

### **🔍 Search & Discovery**
- `tags` - Keyword matching, SEO optimization
- `title` - Full-text search
- `scrapedCategoryName` - Category filtering
- `materials` - Material-based search

### **💰 Pricing Analysis**
- `price_int` - Price comparison
- `priceRange` - Price tier analysis
- `currency_code` - Multi-currency support

### **⭐ Quality Metrics**
- `shop_average_rating` - Seller quality
- `shop_total_rating_count` - Trust indicator
- `in_cart_count` - Demand indicator
- `performanceTag` - Performance categorization

### **🎯 Recommendations**
- `tags` - Tag-based similarity
- `materials` - Material similarity
- `scrapedCategoryName` - Category recommendations
- `priceRange` - Price-based filtering

### **📊 Market Research**
- `tags` - Trending keywords
- `price_int` - Price distribution
- `scrapedCountry` - Geographic analysis
- `is_bestseller` - Top products

---

## ✅ **Standard Scrape vs Two-Step**

| Aspect | Standard (Step 1) | Two-Step (Step 1+2) |
|--------|------------------|---------------------|
| **Fields** | 60 | **65** ✅ |
| **Tags** | ❌ No | ✅ **Yes** |
| **Materials** | ❌ No | ✅ **Yes** |
| **Category Tags** | ❌ No | ✅ **Yes** |
| **Bestseller Flags** | Limited | ✅ **Enhanced** |
| **Cost** | $0.02/category | **$0.02 + $0.001/listing** |
| **Time** | Fast | +1.5s per listing |
| **Use Case** | Broad discovery | **Deep analysis** |

---

## 💰 **Cost Comparison**

### **Standard Scrape Only**:
- Cost: $0.02 per category
- 290K listings: **~$600**
- Fields: 60

### **Two-Step Approach**:
- Step 1: $0.02 per category (~$600)
- Step 2: $0.001 per listing
  - 100 listings: **$0.10**
  - 10K listings: **$10**
  - 100K listings: **$100**
  - 290K listings: **$290**
- **Total for all**: **~$890**
- **Fields**: 65 (including tags!)

---

## 🚀 **When to Use Two-Step Approach**

### ✅ **Use Two-Step For**:
- Product recommendations (need tags for similarity)
- SEO analysis (tags = keywords)
- Material-based filtering
- Deep product understanding
- Embeddings & vector search
- Trend analysis (tag frequency)

### ❌ **Standard Scrape Sufficient For**:
- Basic price monitoring
- Shop analysis
- Category overview
- Simple filtering (price, rating, location)

---

## 📝 **Sample Listing (Two-Step)**

```json
{
  "listing_id": 1870455200,
  "title": "PokePal Keychain: Collectible Character Keyring",
  "url": "https://www.etsy.com/listing/1870455200/...",
  "price": "5.00",
  "price_int": 500,
  "priceRange": "budget",
  
  "shop_name": "Orbitek3D",
  "shop_average_rating": "4.9497",
  "shop_total_rating_count": "215",
  "isStarSeller": true,
  "is_bestseller": true,
  
  "in_cart_count": 105,
  "performanceTag": "high",
  
  "scrapedCategoryName": "keychains",
  "scrapedCountry": "US",
  "scrapedFacet": "relevance",
  
  "tags": [                                    // ✅ NEW
    "pokemon",
    "pokemon keychain",
    "bulbasaur",
    "Pokemon Figurines",
    "charmander",
    "squirtle",
    "Dragonite",
    "Lucario",
    "Mew",
    "Keychains",
    "Piplup",
    "Charizard",
    "Gengar"
  ],
  "materials": [],                             // ✅ NEW
  "category_tags": [],                         // ✅ NEW
  "detailsScrapedAt": "2025-11-07T09:34:52Z"  // ✅ NEW
}
```

---

## ✅ **Summary**

### **What You Get with Two-Step Approach**:

✅ **65 total fields** (vs 60 standard)  
✅ **Product tags/keywords** (5-13 per listing)  
✅ **Materials** (composition data)  
✅ **Enhanced bestseller signals**  
✅ **Timestamp of detail scraping**  
✅ **Perfect for embeddings & recommendations**  
✅ **SEO-optimized keywords**  
✅ **Deep product understanding**

### **Cost**:
- **Incremental**: +$0.001 per listing
- **100 listings**: $0.10
- **10K listings**: $10
- **Full dataset**: $290

### **Recommended Strategy**:
1. Run standard scrape for all 290K listings
2. Use two-step for **priority listings**:
   - Star Sellers
   - Bestsellers
   - High performers
   - Top 100K = ~$100 cost

**This gives you the best balance of coverage vs. cost!** 🚀
