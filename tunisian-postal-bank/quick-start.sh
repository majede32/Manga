#!/bin/bash

# Tunisian Postal Bank Platform - Quick Start Script
# This script helps resolve 404 errors and gets the application running

echo "🏛️  البنك البريدي التونسي - Quick Start Script"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) is installed"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing root dependencies..."
    npm install
fi

# Install client dependencies
if [ ! -d "client/node_modules" ]; then
    print_status "Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Install server dependencies  
if [ ! -d "server/node_modules" ]; then
    print_status "Installing server dependencies..."
    cd server && npm install && cd ..
fi

# Create .env files if they don't exist
if [ ! -f "server/.env" ]; then
    print_status "Creating server .env file..."
    cp server/.env.example server/.env 2>/dev/null || cat > server/.env << EOF
# Development Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# JWT Configuration
JWT_SECRET=development_secret_key_change_in_production_12345678901234567890
JWT_EXPIRY=15m

# CORS
CORS_ORIGIN=http://localhost:3000

# Mock Database (for development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mock_db
DB_USER=mock_user
DB_PASSWORD=mock_password

# Redis (optional for development)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=test@example.com
EMAIL_PASSWORD=test_password

# Logging
LOG_LEVEL=info
EOF
    print_success "Created server/.env with development defaults"
fi

if [ ! -f "client/.env" ]; then
    print_status "Creating client .env file..."
    cat > client/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
EOF
    print_success "Created client/.env with development defaults"
fi

# Create logs directory
mkdir -p server/logs

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Kill any existing processes on our ports
if check_port 5000; then
    print_warning "Port 5000 is in use. Attempting to free it..."
    pkill -f "node.*server" 2>/dev/null || true
    sleep 2
fi

if check_port 3000; then
    print_warning "Port 3000 is in use. Attempting to free it..."
    pkill -f "react-scripts" 2>/dev/null || true
    sleep 2
fi

print_status "Starting the application..."

# Function to start server
start_server() {
    print_status "Starting backend server on port 5000..."
    cd server
    node src/index.js &
    SERVER_PID=$!
    cd ..
    sleep 3
    
    # Check if server started successfully
    if curl -s http://localhost:5000/health > /dev/null; then
        print_success "Backend server started successfully! ✅"
        print_status "Health check: http://localhost:5000/health"
        print_status "API Documentation: http://localhost:5000/"
    else
        print_error "Backend server failed to start properly"
        return 1
    fi
}

# Function to start client
start_client() {
    print_status "Starting frontend client on port 3000..."
    cd client
    npm start &
    CLIENT_PID=$!
    cd ..
    sleep 5
    
    print_success "Frontend client is starting... ✅"
    print_status "Once ready, visit: http://localhost:3000"
}

# Start backend server
if ! start_server; then
    print_error "Failed to start backend server. Check the logs above."
    exit 1
fi

# Start frontend client
start_client

# Show running services
echo ""
echo "🚀 Application Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backend API:     http://localhost:5000"
echo "✅ Health Check:    http://localhost:5000/health"
echo "✅ API Routes:      http://localhost:5000/api/*"
echo "🔄 Frontend:        http://localhost:3000 (starting...)"
echo ""
echo "📋 Available API Endpoints:"
echo "  POST /api/auth/register     - Register new user"
echo "  POST /api/auth/login        - User login"
echo "  GET  /api/auth/me          - Get current user"
echo "  GET  /api/accounts         - Get user accounts"
echo "  GET  /api/transactions     - Get transactions"
echo "  GET  /api/loans           - Get loans"
echo "  GET  /api/notifications   - Get notifications"
echo ""
echo "🔧 Troubleshooting:"
echo "  - Check logs: tail -f server/logs/all.log"
echo "  - Test API: curl http://localhost:5000/health"
echo "  - Kill processes: pkill -f \"node.*server\""
echo ""
echo "📞 Support: dev-support@poste.tn"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Keep script running and monitor
echo ""
print_status "Monitoring services... Press Ctrl+C to stop all services"

# Trap to cleanup on exit
cleanup() {
    echo ""
    print_status "Shutting down services..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
    fi
    if [ ! -z "$CLIENT_PID" ]; then
        kill $CLIENT_PID 2>/dev/null
    fi
    pkill -f "node.*server" 2>/dev/null || true
    pkill -f "react-scripts" 2>/dev/null || true
    print_success "All services stopped. Goodbye!"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Monitor services
while true; do
    sleep 5
    
    # Check if server is still running
    if ! curl -s http://localhost:5000/health > /dev/null; then
        print_error "Backend server appears to be down!"
        break
    fi
done

cleanup