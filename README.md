# Etsy Web Scraper

This project is a powerful, parallelized web scraper designed to extract detailed listing information from Etsy. It uses Node.js, MongoDB for data storage, and the Apify platform for scalable, cloud-based scraping.

---

## 📊 Live Scraping Progress

| Metric                | Status                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Progress**          | ![Progress](https://progress-bar.dev/0/?title=Scraped)                                                            |
| **Listings Scraped**  | `208,159 / 290,708`                                                                                                |
| **Database Status**   | `Online`                                                                                                           |

*This section will be updated automatically by a script.*

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
