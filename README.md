# Etsy Web Scraper

This project is a powerful, parallelized web scraper designed to extract detailed listing information from Etsy. It uses Node.js, MongoDB for data storage, and the Apify platform for scalable, cloud-based scraping.

---

## 📊 Live Scraping Progress

| Metric                | Status                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Progress**          | ![Progress](https://progress-bar.dev/0/?title=Scraped)                                                            |
| **Listings Scraped**  | `226,597 / 290,708`                                                                                                |
| **Database Status**   | `Online`                                                                                                           |

*This section will be updated automatically by a script.*

---

## 🚀 The Project Journey

This project was a multi-stage data engineering challenge, executed in three distinct phases to gather a comprehensive dataset of over 290,000 Etsy listings.

### Phase 1: The Seed - 335 Core Categories

The journey began with a foundational list of 335 primary Etsy categories. This initial dataset was the seed from which the entire project would grow, providing the top-level structure of Etsy's marketplace.

### Phase 2: Branching Out - Discovering Sub-Categories

From the initial 335 categories, a specialized scraper was deployed to recursively discover and map out the entire sub-category tree. This crucial phase expanded our scope, revealing the thousands of niche marketplaces hidden within the main categories and providing the pathways to the individual product listings.

### Phase 3: The Harvest - Scraping 290,000+ Listings

With the complete category map in hand, the final and most intensive phase began. A powerful, parallelized scraper was launched to systematically work through each sub-category and scrape the top listings. This large-scale operation is what is currently in progress, harvesting the rich, detailed data for over 290,000 individual products.

## ✨ Features

- **Parallel Processing**: Runs multiple scraper workers simultaneously to maximize speed.
- **Optimized Workload Distribution**: Intelligently divides remaining listings among active workers.
- **MongoDB Integration**: Stores all scraped data in a structured MongoDB database.
- **Resilient and Retriable**: Automatically retries failed batches to handle network issues.
- **Progress Tracking**: Includes a command-line script to check the real-time progress of all workers.

## 🛠️ Setup and Installation

### Prerequisites

- Node.js (v18 or later)
- MongoDB
- An Apify account and API key

### 1. Clone the Repository

```bash
git clone https://github.com/sarthakJain1008/Web__Scraper.git
cd Web__Scraper
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project and add your configuration details. Use the `.env.example` file as a template.

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/etsy_scraper

# Apify API Keys (add as many as you have)
APIFY_API_TOKEN=your_first_apify_key
APIFY_API_TOKEN_2=your_second_apify_key
# ...and so on
```

## 🚀 How to Run

### Start the Scrapers

To launch the parallel scrapers, run the following command. The script will use all the API keys you've configured in your `.env` file.

```bash
node scrape-parallel-optimized.js
```

### Check Progress

To see the real-time status of the scraping process, run:

```bash
node check-parallel-progress.js
```
