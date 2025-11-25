# Single Listing CSV Export - All 100 Fields

## ✅ File Created

**Filename**: `single_listing_all_fields.csv`  
**Size**: 5.8 KB  
**Rows**: 2 (1 header + 1 data row)  
**Columns**: 100 fields  

---

## 📋 Listing Details

This CSV contains complete data for one listing:

- **Title**: Thai BL Keychains, BL ships, BL merch
- **Shop**: RizzerDesigns (⭐ Star Seller)
- **Price**: $5.00
- **URL**: https://www.etsy.com/listing/1870455200/thai-bl-keychains-bl-ships-bl-merch
- **Category**: keychains
- **Country**: United States

---

## 📊 All 100 Fields Included

### Column Names (in alphabetical order):

1. Shop
2. accepts_gift_card
3. are_exchanges_accepted
4. are_returns_accepted
5. buy_it_now_details
6. can_be_waitlisted
7. color_swatches
8. country_specific_pricing
9. create_date
10. createdAt
11. currency_code
12. currency_symbol
13. display_as_large_ad
14. for_pattern_consumption
15. for_public_consumption
16. free_shipping_countries
17. free_shipping_data
18. has_manually_adjusted_thumbnail
19. has_star_seller_signal
20. has_variations
21. has_variations_with_pricing
22. img *(Contains 9 image URLs)*
23. in_cart_count
24. isEtsyPick
25. isStarSeller
26. is_bestseller
27. is_bestseller_by_fixed_qty_category_l3
28. is_bestseller_by_fixed_qty_category_leaf
29. is_buyer_promise_eligible
30. is_customizable
31. is_download
32. is_eligible_for_loyalty_free_shipping
33. is_handmade
34. is_in_merch_library
35. is_listing_image_landscape
36. is_machine_translated
37. is_made_to_order
38. is_pattern
39. is_personalizable
40. is_previously_favorited_from_shop
41. is_previously_purchased_from_shop
42. is_private
43. is_retail
44. is_scarce
45. is_sold_out
46. is_surfaceable
47. is_top_rated
48. is_unique
49. is_vacation
50. is_vintage
51. last_sale_date
52. listing_id
53. listing_image_count
54. listing_images *(Array of all product photos)*
55. listing_review_photo_count
56. listing_review_video_count
57. logging
58. lowest_purchasable_price
59. material_swatches
60. max_processing_days
61. min_processing_days
62. num_color_variations
63. num_size_variations
64. origin_country_id
65. origin_postal_code
66. original_create_date
67. performanceTag
68. price
69. priceRange
70. price_formatted_short
71. price_int
72. price_unformatted
73. promotions
74. quantity
75. return_deadline_in_days
76. scrapedAt
77. scrapedCategory
78. scrapedCategoryName
79. scrapedCountry
80. scrapedCountryName
81. scrapedFacet
82. scrapedSearchTerm
83. seller_taxonomy_id
84. ships_to_regions
85. shop_average_rating
86. shop_id
87. shop_name
88. shop_total_rating_count
89. shop_url
90. should_show_buy_it_now_button
91. signal_pecking_order
92. state
93. style_attributes
94. subcategory
95. suppression_restrictions
96. title
97. transit_details_calculated
98. updatedAt
99. url
100. use_pretty_pricing

---

## 🔍 Data Format

### Simple Fields
Exported as plain values:
- `title` → "Thai BL Keychains, BL ships, BL merch"
- `price` → "5.00"
- `isStarSeller` → "true"

### Object Fields
Exported as JSON strings:
- `Shop` → `{"shop_id":38005758,"shop_name":"RizzerDesigns"}`
- `img` → `{"url":"https://...", "url_300x300":"https://...", ...}`

### Array Fields
Exported as JSON arrays:
- `listing_images` → `[{"url":"https://...","height":3000,...}, ...]`
- `ships_to_regions` → `["US"]`

### Date Fields
Exported as ISO strings:
- `scrapedAt` → "2025-11-05T13:20:52.375Z"

---

## 💡 How to Use

### Open in Excel/Google Sheets
1. Open the CSV file
2. Object/Array fields will appear as JSON strings
3. Use JSON parsing functions to extract nested data

### Parse in Python
```python
import pandas as pd
import json

df = pd.read_csv('single_listing_all_fields.csv')

# Parse JSON fields
df['Shop'] = df['Shop'].apply(json.loads)
df['img'] = df['img'].apply(json.loads)
df['listing_images'] = df['listing_images'].apply(json.loads)

# Access nested data
print(df['Shop'][0]['shop_name'])  # "RizzerDesigns"
print(df['img'][0]['url_300x300'])  # Image URL
```

### Parse in JavaScript/Node.js
```javascript
import fs from 'fs';
import csv from 'csv-parser';

const results = [];

fs.createReadStream('single_listing_all_fields.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Parse JSON fields
    row.Shop = JSON.parse(row.Shop);
    row.img = JSON.parse(row.img);
    row.listing_images = JSON.parse(row.listing_images);
    
    results.push(row);
  })
  .on('end', () => {
    console.log(results[0].Shop.shop_name); // "RizzerDesigns"
    console.log(results[0].img.url_300x300); // Image URL
  });
```

---

## 🎯 Key Fields Quick Reference

### Essential Product Info
- `url`, `title`, `price`, `listing_id`

### Images (in `img` field)
```json
{
  "url": "full_resolution_image.jpg",
  "url_75x75": "tiny_thumbnail.jpg",
  "url_170x135": "small.jpg",
  "url_224xN": "medium_small.jpg",
  "url_300x300": "square_medium.jpg",
  "url_340x270": "card_size.jpg",
  "url_570xN": "large.jpg",
  "url_600x600": "square_large.jpg",
  "url_680x540": "extra_large.jpg"
}
```

### Shop Info
- `shop_name`, `shop_id`, `shop_url`
- `shop_average_rating`, `shop_total_rating_count`

### Our Metadata
- `scrapedCountry`, `scrapedCategoryName`, `scrapedFacet`
- `isStarSeller`, `isEtsyPick`, `priceRange`, `performanceTag`

---

## 📦 Use Cases

**✅ Backend API Development**
- See exact data structure
- Test JSON parsing logic
- Validate field types

**✅ Data Analysis**
- Import into Excel/Sheets
- Test formulas and filters
- Prototype dashboards

**✅ Frontend Development**
- Test image URL handling
- Design product cards
- Mock API responses

**✅ Database Schema Design**
- Understand nested structures
- Design table schemas
- Plan data transformations

---

## 🔄 Export Different Listing

To export a different listing:

```bash
# Edit export-single-listing.js to change the query
# Then run:
node export-single-listing.js
```

Or query by specific ID:
```javascript
const listing = await collection.findOne({ listing_id: YOUR_ID_HERE });
```

---

## ✅ Summary

You now have a **complete CSV export** of one listing with:
- ✅ All 100 fields
- ✅ Nested objects as JSON
- ✅ Arrays as JSON
- ✅ Ready to import anywhere

**File**: `single_listing_all_fields.csv` (5.8 KB)
