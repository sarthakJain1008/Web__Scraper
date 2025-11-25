#!/bin/bash
# start-optimized-scraper.sh
# Launch optimized scraper with 10 APIs - divides only remaining listings

echo "🚀 Starting OPTIMIZED Parallel Detail Scraper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Strategy: Divide only REMAINING unprocessed listings among 10 APIs"
echo "Each API gets equal share of unprocessed work"
echo "No duplicate work, optimal efficiency"
echo ""
echo "Logs will be saved to:"
echo "  - logs/optimized-api-0.log through logs/optimized-api-9.log"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create logs directory
mkdir -p logs

# Start all 10 workers in background
for i in {0..9}; do
  echo "🚀 Starting Optimized API Worker $((i+1))/10..."
  API_KEY_INDEX=$i nohup node scrape-parallel-optimized.js > logs/optimized-api-$i.log 2>&1 &
  PID=$!
  echo "   ✅ Started with PID: $PID"
  sleep 2 # Small delay to avoid overwhelming the system
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All 10 optimized workers started!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Monitor progress with:"
echo "   node check-parallel-progress.js"
echo ""
echo "📊 View logs:"
echo "   tail -f logs/optimized-api-0.log"
echo "   tail -f logs/optimized-api-1.log"
echo "   ... etc"
echo ""
echo "📊 View all workers:"
echo "   ps aux | grep scrape-parallel-optimized"
echo ""
echo "🛑 Stop all workers:"
echo "   pkill -f scrape-parallel-optimized"
echo ""
