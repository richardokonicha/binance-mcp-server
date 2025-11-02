#!/bin/bash

# Binance MCP Server Deployment Script
# This script deploys your MCP server to a remote server

set -e

# Configuration - UPDATE THESE VALUES
REMOTE_USER="${REMOTE_USER:-your-username}"
REMOTE_HOST="${REMOTE_HOST:-your-server.com}"
REMOTE_PATH="${REMOTE_PATH:-/home/$REMOTE_USER/binance-mcp-server}"

echo "🚀 Deploying Binance MCP Server to $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Building the project locally...${NC}"
npm run build

echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"
# Create a temp directory for deployment
DEPLOY_DIR=$(mktemp -d)
trap "rm -rf $DEPLOY_DIR" EXIT

# Copy necessary files
cp -r dist "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"
cp .env.example "$DEPLOY_DIR/"
cp README.md "$DEPLOY_DIR/" 2>/dev/null || true
cp Dockerfile "$DEPLOY_DIR/" 2>/dev/null || true
cp docker-compose.yml "$DEPLOY_DIR/" 2>/dev/null || true

echo -e "${YELLOW}Step 3: Syncing files to remote server...${NC}"
# Use rsync for efficient transfer
rsync -avz --delete \
  "$DEPLOY_DIR/" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

echo -e "${YELLOW}Step 4: Installing dependencies on remote server...${NC}"
ssh "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
cd "$REMOTE_PATH"

# Install dependencies
npm install --production

# Check if .env exists, if not create from .env.example
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Please create one from .env.example and configure your API keys."
  echo "Copy .env.example to .env and update with your credentials:"
  echo "  cd $REMOTE_PATH"
  echo "  cp .env.example .env"
  echo "  nano .env"
else
  echo "✅ .env file found"
fi

# Test the server
echo "Testing MCP server..."
timeout 5 node dist/index.js || echo "Server test completed"

ENDSSH

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. SSH into your server and configure .env:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST"
echo "   cd $REMOTE_PATH"
echo "   nano .env"
echo ""
echo "2. Update your Claude Desktop config (~/Library/Application Support/Claude/claude_desktop_config.json):"
echo "   {"
echo "     \"mcpServers\": {"
echo "       \"binance-mcp-server-remote\": {"
echo "         \"command\": \"ssh\","
echo "         \"args\": ["
echo "           \"$REMOTE_USER@$REMOTE_HOST\","
echo "           \"cd $REMOTE_PATH && node dist/index.js\""
echo "         ]"
echo "       }"
echo "     }"
echo "   }"
echo ""
echo "3. Restart Claude Desktop"
