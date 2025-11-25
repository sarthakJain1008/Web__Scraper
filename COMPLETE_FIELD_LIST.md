# Complete Dataset Field List

## Total: 100 Fields Available

---

## 🔑 CORE IDENTIFIERS (4 fields)

1. **listing_id** - Unique Etsy listing ID (number)
2. **url** - Full Etsy listing URL (string)
3. **title** - Product title (string)
4. **state** - Listing state: "active", "sold_out", etc. (string)

---

## 💰 PRICING (9 fields)

5. **price** - Price as string (e.g., "5.00")
6. **price_int** - Price in cents (number)
7. **price_unformatted** - Unformatted price string
8. **price_formatted_short** - Formatted price (e.g., "$5.00")
9. **currency_code** - Currency code (e.g., "USD")
10. **currency_symbol** - Currency symbol (e.g., "$")
11. **country_specific_pricing** - Pricing by region (object)
12. **lowest_purchasable_price** - Lowest variant price (object)
13. **use_pretty_pricing** - UI formatting flag (boolean)

---

## 🏪 SHOP INFORMATION (6 fields)

14. **shop_id** - Unique shop ID (number)
15. **shop_name** - Shop name (string)
16. **shop_url** - Shop URL (string)
17. **shop_average_rating** - Average rating 0-5 (string)
18. **shop_total_rating_count** - Number of reviews (string)
19. **Shop** - Shop object with additional details (object)

---

## 📸 IMAGE DATA (6 fields)

20. **img** - Main image with 9 size variants (object)
    - url, url_75x75, url_170x135, url_224xN, url_300x300
    - url_340x270, url_570xN, url_600x600, url_680x540
    - Also includes: height, width, color, blur_hash
21. **listing_images** - Array of all product images (array)
22. **listing_image_count** - Number of images (number)
23. **listing_review_photo_count** - Customer photos count (number)
24. **listing_review_video_count** - Review videos count (number)
25. **is_listing_image_landscape** - Image orientation (boolean)

---

## 🏷️ SCRAPING METADATA - Our Tags (7 fields)

26. **scrapedCountry** - Country code: US, GB, DE, AU, CA (string)
27. **scrapedCountryName** - Full country name (string)
28. **scrapedCategoryName** - Category slug (string)
29. **scrapedCategory** - Full category URL (string)
30. **scrapedSearchTerm** - Search query used (string)
31. **scrapedFacet** - Sort method: relevance, most_recent, high_price, low_price (string)
32. **subcategory** - Original category URL (string)

---

## ⭐ QUALITY & PERFORMANCE - Our Computed Tags (4 fields)

33. **isStarSeller** - Star seller badge (boolean)
34. **isEtsyPick** - Etsy's pick badge (boolean)
35. **priceRange** - Price bucket: budget, low, medium, high, premium (string)
36. **performanceTag** - Quality tier: high, medium, low (string)

---

## 🎖️ ETSY BADGES & SIGNALS (11 fields)

37. **has_star_seller_signal** - Official star seller (boolean)
38. **is_top_rated** - Top rated seller (boolean)
39. **is_in_merch_library** - Etsy's pick (boolean)
40. **is_bestseller** - Bestseller badge (boolean)
41. **is_bestseller_by_fixed_qty_category_l3** - Category bestseller (boolean)
42. **is_bestseller_by_fixed_qty_category_leaf** - Leaf category bestseller (boolean)
43. **is_handmade** - Handmade item (boolean)
44. **is_vintage** - Vintage item (boolean)
45. **is_unique** - Unique/one-of-a-kind (boolean)
46. **is_scarce** - Limited availability (boolean)
47. **signal_pecking_order** - Priority signals (array)

---

## 📦 PRODUCT DETAILS (14 fields)

48. **quantity** - Available quantity (number)
49. **is_sold_out** - Out of stock (boolean)
50. **is_customizable** - Can be customized (boolean)
51. **is_personalizable** - Can be personalized (boolean)
52. **is_made_to_order** - Made to order (boolean)
53. **is_download** - Digital download (boolean)
54. **is_pattern** - Pattern/template (boolean)
55. **has_variations** - Has size/color options (boolean)
56. **has_variations_with_pricing** - Variant pricing (boolean)
57. **num_color_variations** - Number of colors (number)
58. **num_size_variations** - Number of sizes (number)
59. **color_swatches** - Color options (array)
60. **material_swatches** - Material options (array)
61. **style_attributes** - Style tags (array)

---

## 🚚 SHIPPING (7 fields)

62. **free_shipping_data** - Free shipping details (object)
63. **free_shipping_countries** - Countries with free shipping (array)
64. **ships_to_regions** - Shipping regions (array)
65. **transit_details_calculated** - Carrier details (object)
66. **is_eligible_for_loyalty_free_shipping** - Loyalty program (boolean)
67. **is_buyer_promise_eligible** - Buyer promise eligible (boolean)
68. **min_processing_days** - Min processing time (number)
69. **max_processing_days** - Max processing time (number)

---

## 📊 ENGAGEMENT METRICS (3 fields)

70. **in_cart_count** - Times added to cart (number)
71. **promotions** - Active promotions (array)
72. **display_as_large_ad** - Ad display flag (boolean)

---

## 🌍 ORIGIN & LOCATION (3 fields)

73. **origin_country_id** - Seller country ID (number)
74. **origin_postal_code** - Seller postal code (string)
75. **seller_taxonomy_id** - Etsy category taxonomy (number)

---

## 🔄 RETURNS & POLICIES (4 fields)

76. **are_returns_accepted** - Returns allowed (boolean)
77. **are_exchanges_accepted** - Exchanges allowed (boolean)
78. **return_deadline_in_days** - Return window (number)
79. **accepts_gift_card** - Accepts gift cards (boolean)

---

## 📅 TIMESTAMPS (6 fields)

80. **scrapedAt** - When we scraped this (date)
81. **createdAt** - When added to our DB (date)
82. **updatedAt** - Last DB update (date)
83. **create_date** - Etsy listing created (timestamp)
84. **original_create_date** - Original creation (timestamp)
85. **last_sale_date** - Last sale timestamp (timestamp)

---

## 🛒 PURCHASE OPTIONS (3 fields)

86. **buy_it_now_details** - Buy now options (array)
87. **should_show_buy_it_now_button** - Show buy button (boolean)
88. **can_be_waitlisted** - Waitlist available (boolean)

---

## 🔒 VISIBILITY & STATUS (10 fields)

89. **is_private** - Private listing (boolean)
90. **is_surfaceable** - Can appear in search (boolean)
91. **is_vacation** - Shop on vacation (boolean)
92. **for_public_consumption** - Public listing (boolean)
93. **for_pattern_consumption** - Pattern listing (boolean)
94. **is_retail** - Retail item (boolean)
95. **is_machine_translated** - Auto-translated (boolean)
96. **has_manually_adjusted_thumbnail** - Custom thumbnail (boolean)
97. **suppression_restrictions** - Restrictions (array)
98. **is_previously_favorited_from_shop** - User favorited (boolean)
99. **is_previously_purchased_from_shop** - User purchased (boolean)

---

## 📝 INTERNAL & LOGGING (1 field)

100. **logging** - Internal logging data (object)

---

## 📊 FIELD TYPE SUMMARY

- **String**: 23 fields (text data)
- **Number**: 19 fields (integers, IDs, counts)
- **Boolean**: 45 fields (true/false flags)
- **Object**: 8 fields (nested data structures)
- **Array**: 11 fields (lists)
- **Date**: 3 fields (timestamps)

---

## 🎯 MOST USEFUL FIELDS FOR ANALYSIS

### Core Product Info:
- `url`, `title`, `price`, `listing_id`

### Shop Quality:
- `shop_name`, `shop_average_rating`, `shop_total_rating_count`
- `isStarSeller`, `is_top_rated`

### Images:
- `img.url_300x300` (thumbnail)
- `img.url_570xN` (large)
- `listing_images` (all photos)

### Scraping Context:
- `scrapedCountry`, `scrapedCategoryName`, `scrapedFacet`

### Analysis Tags:
- `priceRange`, `performanceTag`, `isEtsyPick`

### Engagement:
- `in_cart_count`, `listing_review_photo_count`

### Product Attributes:
- `is_handmade`, `is_customizable`, `quantity`

### Shipping:
- `free_shipping_data`, `min_processing_days`, `max_processing_days`

---

## 💾 EXPORTED TO CSV (Current)

The current CSV export (`etsy_listings_export.csv`) contains **23 core fields**.

All **100 fields** are available in the MongoDB database for direct queries.
