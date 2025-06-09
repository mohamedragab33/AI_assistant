#!/bin/bash

# Docker entrypoint for Bitcoin Trading AI
set -e

echo "🚀 Starting Bitcoin Elite Trading AI..."

# Wait for MongoDB if provided
if [ ! -z "$MONGODB_URL" ]; then
    echo "⏳ Waiting for MongoDB connection..."
    python -c "
import pymongo
import time
import os
try:
    client = pymongo.MongoClient(os.environ.get('MONGODB_URL', 'mongodb://localhost:27017'))
    client.admin.command('ping')
    print('✅ MongoDB connected')
except Exception as e:
    print(f'❌ MongoDB connection failed: {e}')
    exit(1)
"
fi

# Function to handle shutdown
cleanup() {
    echo "🛑 Shutting down services..."
    kill $(jobs -p) 2>/dev/null || true
    wait
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Start authentication server in background
echo "🔐 Starting authentication server on port 8001..."
python auth_server.py &
AUTH_PID=$!

# Wait a moment for auth server to start
sleep 3

# Start main API server in background  
echo "📊 Starting main API server on port 8000..."
python start_simple.py &
API_PID=$!

# Start frontend server (if in development mode)
if [ "$NODE_ENV" != "production" ]; then
    echo "🎨 Starting frontend development server on port 3000..."
    cd frontend && npm start &
    FRONTEND_PID=$!
else
    echo "🎨 Serving frontend build files..."
    python -m http.server 3000 --directory frontend/build &
    FRONTEND_PID=$!
fi

# Wait for any process to exit
wait -n

# If we get here, one of the processes died, so kill the others
cleanup 