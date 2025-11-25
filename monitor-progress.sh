#!/bin/bash
# monitor-progress.sh
# Live monitoring dashboard for parallel scraping

while true; do
  clear
  echo "╔════════════════════════════════════════════════════════════════════╗"
  echo "║         🚀 PARALLEL SCRAPER - LIVE MONITORING                     ║"
  echo "╚════════════════════════════════════════════════════════════════════╝"
  echo ""
  
  # Check if workers are running
  WORKER_COUNT=$(ps aux | grep "scrape-parallel-details" | grep -v grep | wc -l | tr -d ' ')
  echo "🔧 Active Workers: $WORKER_COUNT / 10"
  echo ""
  
  # Show progress
  node check-parallel-progress.js
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 Recent Activity (last 5 lines from each worker):"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  for i in {0..9}; do
    if [ -f "logs/api-worker-$i.log" ]; then
      echo ""
      echo "API $((i+1)):"
      tail -3 "logs/api-worker-$i.log" | grep -E "(Batch|Progress|✅|❌|Updated)" || echo "  Starting..."
    fi
  done
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⌨️  Press Ctrl+C to stop monitoring (workers continue in background)"
  echo "🛑 To stop all workers: pkill -f scrape-parallel-details"
  echo ""
  
  # Update every 30 seconds
  sleep 30
done
