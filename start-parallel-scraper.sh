#!/bin/bash
# start-parallel-scraper.sh
# Launch all 10 API workers in parallel

echo "🚀 Starting Parallel Detail Scraper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will start 10 parallel workers, each processing ~29K listings"
echo "Total: 290K listings across 10 API keys"
echo ""
echo "Logs will be saved to:"
echo "  - api-worker-0.log"
echo "  - api-worker-1.log"
echo "  - ... api-worker-8.log"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create logs directory
mkdir -p logs

# Start all 10 workers in background
for i in {0..9}; do
  echo "🚀 Starting API Worker $((i+1))/10..."
  API_KEY_INDEX=$i nohup node scrape-parallel-details.js > logs/api-worker-$i.log 2>&1 &
  PID=$!
  echo "   ✅ Started with PID: $PID"
  sleep 2 # Small delay to avoid overwhelming the system
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All 10 workers started!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Monitor progress with:"
echo "   tail -f logs/api-worker-0.log"
echo "   tail -f logs/api-worker-1.log"
echo "   ... etc"
echo ""
echo "📊 View all workers:"
echo "   ps aux | grep scrape-parallel-details"
echo ""
echo "🛑 Stop all workers:"
echo "   pkill -f scrape-parallel-details"
echo ""
echo "📈 Check overall progress:"
echo "   node check-parallel-progress.js"
echo ""
