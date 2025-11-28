#!/bin/bash
# DevWell Backend Startup Script

cd "$(dirname "$0")"

echo "🚀 Starting DevWell Backend..."
echo ""

# Check if MongoDB is running
if ! pgrep -x mongod > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "Starting MongoDB..."
    sudo systemctl start mongodb
    sleep 2
fi

# Check MongoDB status
if pgrep -x mongod > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ Failed to start MongoDB"
    exit 1
fi

echo "✅ Starting Node.js server..."
npm start
