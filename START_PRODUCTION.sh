#!/bin/bash
# Production Startup Script for Etsy Scraper
# ==========================================

echo "🛍️  ETSY SCRAPER - Production Startup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "📝 Please create .env with the following:"
    echo ""
    echo "APIFY_API_TOKEN=your_token_here"
    echo "MONGODB_URI=mongodb://localhost:27017"
    echo "MONGODB_DATABASE=etsy_scraper_production"
    echo "NUM_WORKERS=5"
    echo "LISTINGS_PER_COUNTRY=300"
    echo "CSV_FILE_PATH=./categories.csv"
    echo "TEST_MODE=false"
    echo ""
    exit 1
fi

# Check if MongoDB is running
echo "🔍 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB not running. Attempting to start..."
    brew services start mongodb-community@6.0 2>/dev/null || {
        echo "❌ Could not start MongoDB. Please start it manually."
        exit 1
    }
    sleep 2
fi
echo "✅ MongoDB is running"

# Check if categories.csv exists
if [ ! -f categories.csv ]; then
    echo "❌ ERROR: categories.csv not found!"
    exit 1
fi
echo "✅ Found categories.csv"

# Count categories
CATEGORY_COUNT=$(tail -n +2 categories.csv | wc -l | tr -d ' ')
echo "📊 Categories to scrape: $CATEGORY_COUNT"

# Estimate cost and time
TOTAL_CALLS=$((CATEGORY_COUNT * 20))
COST=$(echo "scale=2; $TOTAL_CALLS * 0.001" | bc)
echo "💰 Estimated cost: \$$COST"
echo "⏱️  Estimated time: 28-56 hours (with 5 workers)"
echo ""

# Confirm
read -p "🚀 Start production scrape? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Aborted"
    exit 0
fi

# Create logs directory
mkdir -p logs

# Start scraper
echo ""
echo "🚀 Starting production scraper..."
echo "📝 Logs will be saved to: logs/scraper_$(date +%Y%m%d_%H%M%S).log"
echo ""
echo "💡 To monitor progress:"
echo "   tail -f logs/scraper_*.log"
echo ""
echo "💡 To check database:"
echo "   npm run query"
echo ""

# Run in background with logs
LOGFILE="logs/scraper_$(date +%Y%m%d_%H%M%S).log"
nohup npm start > "$LOGFILE" 2>&1 &
PID=$!

echo $PID > logs/scraper.pid
echo "✅ Scraper started with PID: $PID"
echo "📝 Log file: $LOGFILE"
echo ""
echo "💡 Commands:"
echo "   Monitor: tail -f $LOGFILE"
echo "   Stop:    kill $PID"
echo "   Status:  ps -p $PID"
echo ""
