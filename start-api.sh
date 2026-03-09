#!/bin/bash
# OpenClaw Monitor Extension - API Server Startup Script

API_DIR="$HOME/.openclaw/workspace-programmer/openclaw-monitor-extension"
LOG_FILE="/tmp/openclaw-monitor-api.log"
PID_FILE="/tmp/openclaw-monitor-api.pid"

# 检查是否已经在运行
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "API server is already running (PID: $PID)"
        exit 0
    fi
fi

# 启动 API 服务
echo "Starting OpenClaw Monitor API..."
cd "$API_DIR"
nohup node openclaw-sessions-api.js > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

echo "API server started (PID: $(cat $PID_FILE))"
echo "Log file: $LOG_FILE"
