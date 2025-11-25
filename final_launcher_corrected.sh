#!/bin/bash

(API_KEY_INDEX=0 nohup node scrape-parallel-optimized.js > logs/optimized-worker-0.log 2>&1 &)
(API_KEY_INDEX=1 nohup node scrape-parallel-optimized.js > logs/optimized-worker-1.log 2>&1 &)
(API_KEY_INDEX=2 nohup node scrape-parallel-optimized.js > logs/optimized-worker-2.log 2>&1 &)
(API_KEY_INDEX=7 nohup node scrape-parallel-optimized.js > logs/optimized-worker-7.log 2>&1 &)
(API_KEY_INDEX=8 nohup node scrape-parallel-optimized.js > logs/optimized-worker-8.log 2>&1 &)
(API_KEY_INDEX=9 nohup node scrape-parallel-optimized.js > logs/optimized-worker-9.log 2>&1 &)
(API_KEY_INDEX=0 nohup node scrape-parallel-optimized.js > logs/optimized-worker-0-dup.log 2>&1 &)
(API_KEY_INDEX=1 nohup node scrape-parallel-optimized.js > logs/optimized-worker-1-dup.log 2>&1 &)
(API_KEY_INDEX=2 nohup node scrape-parallel-optimized.js > logs/optimized-worker-2-dup.log 2>&1 &)
(API_KEY_INDEX=7 nohup node scrape-parallel-optimized.js > logs/optimized-worker-7-dup.log 2>&1 &)

