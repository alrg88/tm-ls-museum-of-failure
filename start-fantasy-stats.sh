#!/bin/bash

# Fantasy Football Stats - Startup Script
# This script starts the development server and opens the website in your browser

cd "$(dirname "$0")"

echo "🏈 Starting Fantasy Football Stats Dashboard..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start the development server in the background
npm run dev &
SERVER_PID=$!

echo ""
echo "✅ Server starting..."
echo "⏳ Waiting for server to be ready..."

# Wait for the server to be ready (max 30 seconds)
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo ""
        echo "🚀 Fantasy Football Stats is ready!"
        echo ""
        echo "📊 Dashboard: http://localhost:3000"
        echo ""
        echo "Press Ctrl+C to stop the server"
        echo ""

        # Try to open in Windows browser (WSL2 specific)
        if command -v cmd.exe &> /dev/null; then
            cmd.exe /c start http://localhost:3000
        elif command -v wslview &> /dev/null; then
            wslview http://localhost:3000
        else
            echo "💡 Open http://localhost:3000 in your browser"
        fi

        # Wait for the server process
        wait $SERVER_PID
        exit 0
    fi
    sleep 1
done

echo "❌ Server failed to start. Check the error messages above."
kill $SERVER_PID 2>/dev/null
exit 1
