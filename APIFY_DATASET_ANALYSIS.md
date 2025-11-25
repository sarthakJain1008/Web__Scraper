# Apify Dataset Analysis

**Source**: https://api.apify.com/v2/datasets/U80gNfqxEabPc1e2u/items?format=json&clean=true

**Downloaded**: `apify_full.json` (514 KB)

---

## 📊 Dataset Structure

### Main Array
- **Total Items**: 1 (single result object)
- **Structure**: Array containing one complete scrape result

### Top-Level Keys (14 sections)
1. **available_sections** - null
2. **detailed_free_shipping** - Object with shipping details
3. **faqs** - null
4. **featured_listings** - **Array[4]** - Main listings data ⭐
5. **gdpr_third_party_ip_disclosure** - Object
6. **listing** - Object (full listing details)
7. **listing_videos** - Array
8. **member_data** - Object (shop info)
9. **policies** - Object (shop policies)
10. **suggested_searches** - null
11. **sustainability** - Object
12. **transparent_price_message** - String
13. **user_favorited_listings_7d_count** - null
14. **variations** - null
15. **view_in_room** - Object
16. **visually_similar_recs_landing_experience** - null

---

## 🎯 Main Data: Featured Listings

**Total Listings**: **4 listings**

Each listing contains **126 fields** with complete Etsy data.

---

## 📋 Complete Field List (126 Fields)

### Listing Identifiers
1. listing_id
2. url
3. title
4. state

### Pricing (10 fields)
5. price
6. price_int
7. price_unformatted
8. price_formatted_short
9. price_formatted_with_locale
10. currency_code
11. currency_symbol
12. country_specific_pricing
13. lowest_purchasable_price
14. use_pretty_pricing

### Discounts & Promotions (7 fields)
15. discount_description
16. discount_description_unescaped
17. discounted_price_formatted_with_locale
18. discounted_price_int_usd
19. discounted_price_unformatted
20. promotion_data
21. promotions (array)

### Shop Information (6 fields)
22. shop_id
23. shop_name
24. shop_url
25. shop_average_rating
26. shop_total_rating_count
27. user_id

### Images (6 fields)
28. img (object with 20+ size variants!)
29. img_2
30. listing_images (array)
31. listing_image_count
32. image_key_from_cache
33. has_manually_adjusted_thumbnail
34. is_listing_image_landscape
35. main_image_gen_ai_alt_text
36. seller_provided_crop_data
37. video
38. video_key

### Quality Badges (11 fields)
39. has_star_seller_signal
40. is_top_rated
41. is_bestseller
42. is_bestseller_by_fixed_qty_category_l3
43. is_bestseller_by_fixed_qty_category_leaf
44. is_bestseller_nightly
45. is_in_merch_library
46. is_popular_now
47. is_handmade
48. is_vintage
49. is_unique

### Product Attributes (15 fields)
50. quantity
51. is_sold_out
52. is_customizable
53. is_personalizable
54. is_made_to_order
55. is_download
56. is_pattern
57. has_variations
58. has_variations_with_pricing
59. has_color_variations
60. num_color_variations
61. num_size_variations
62. variations_data
63. style_attributes
64. material_attribute_value_ids
65. llm_inferred_attribute_value_ids
66. llm_inferred_attributes_to_variation_ids
67. has_legacy_materials

### Shipping (10 fields)
68. free_shipping_data
69. free_shipping_countries
70. ships_to_regions
71. transit_details_calculated
72. transit_details_manual
73. shipping_costs
74. min_processing_days
75. max_processing_days
76. min_edd_days_to_user
77. max_edd_days_to_user
78. estimated_delivery

### Engagement Metrics (8 fields)
79. in_cart_count
80. view_count
81. favorites_count
82. is_favorite
83. collections_count
84. is_in_collections
85. listing_review_photo_count
86. listing_review_video_count
87. top_english_review

### Returns & Policies (3 fields)
88. accepts_gift_card
89. are_exchanges_accepted
90. are_returns_accepted
91. return_deadline_in_days

### Timestamps (5 fields)
92. create_date
93. original_create_date
94. last_sale_date
95. purchase_date
96. merch_library_update_timestamp

### Origin & Location (3 fields)
97. origin_country_id
98. origin_postal_code
99. seller_taxonomy_id

### Visibility & Status (12 fields)
100. is_private
101. is_surfaceable
102. is_vacation
103. for_public_consumption
104. for_pattern_consumption
105. is_retail
106. is_scarce
107. is_machine_translated
108. display_as_large_ad
109. suppression_restrictions
110. is_buyer_promise_eligible
111. is_wholesale
112. wholesale_url

### Purchase Options (3 fields)
113. buy_it_now_details
114. should_show_buy_it_now_button
115. can_be_waitlisted

### Search & Discovery (5 fields)
116. signal_pecking_order
117. organic_search_debug_data
118. prolist_debug_data
119. attribution_key
120. cluster_name
121. more_like_this

### Interactions & History (2 fields)
122. listing_interactions
123. added_to_cart_during_time_period

### Other (4 fields)
124. logging
125. dynamic_aspect_ratio_data
126. alternate_title

---

## 🔍 Key Differences vs Your Current Database

### More Image Sizes
Apify data has **20+ image size variants**:
- url_75x75, url_170x135, url_175x175, url_224xN
- url_255x340, url_300x200, url_300x300, url_340x270
- url_372x296, url_500x500, url_570xN, url_600x600
- url_642xN, url_680x540, url_744x592, url_794xN
- url_1000x1000, url_1140xN, url_1588xN
- url (full resolution)

### Additional Fields Not in Your DB
- **Promotions**: Full promotion_data object with discounts
- **Variations**: variations_data array
- **Wholesale**: wholesale_url
- **AI**: llm_inferred attributes
- **Purchase tracking**: purchase_date, added_to_cart_during_time_period
- **Reviews**: top_english_review

### Similar Fields
Most core fields match your database:
- listing_id, url, title, price
- shop info, ratings
- badges (star_seller, bestseller, etc.)
- product attributes
- shipping details
- timestamps

---

## 📊 Summary

**Total Listings**: **4**  
**Fields per Listing**: **126**  
**File Size**: 514 KB  
**Format**: JSON array with 1 result object containing 4 listings

### Structure:
```javascript
[
  {
    "featured_listings": [
      { /* Listing 1 - 126 fields */ },
      { /* Listing 2 - 126 fields */ },
      { /* Listing 3 - 126 fields */ },
      { /* Listing 4 - 126 fields */ }
    ],
    "listing": { /* Full listing details */ },
    "member_data": { /* Shop info */ },
    "policies": { /* Shop policies */ },
    // ... other metadata
  }
]
```

---

## 💡 Comparison to Your Database

| Metric | Your Database | Apify Dataset |
|--------|---------------|---------------|
| **Total Listings** | ~225,000+ | 4 |
| **Fields per Listing** | 100 | 126 |
| **Image Variants** | 9 sizes | 20+ sizes |
| **Countries** | 5 (US, GB, DE, AU, CA) | Not specified |
| **Categories** | 226+ | Unknown |
| **Metadata Tags** | Custom (scraped*, performance, etc.) | Etsy raw data |
| **Promotions** | Basic promotions array | Full promotion_data |
| **Variations** | Basic flags | Full variations_data |

---

## ✅ Files Created

- **apify_full.json** (514 KB) - Full JSON download
- **APIFY_DATASET_ANALYSIS.md** - This analysis document

---

**Your database has significantly more listings (225K+ vs 4) and better coverage across countries and categories!**

The Apify dataset appears to be a single scrape result with 4 featured listings, while your database has a comprehensive collection optimized for analysis.
