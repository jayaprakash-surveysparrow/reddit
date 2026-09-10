#!/bin/bash
# Opens server.js, workers/index.js, and monitor/queueMetrics.js each in
# their own Terminal.app window (macOS only).
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR' && node server.js\""
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR' && node workers/index.js\""
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR' && node monitor/queueMetrics.js\""
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR' && node monitor/dashboard.js\""