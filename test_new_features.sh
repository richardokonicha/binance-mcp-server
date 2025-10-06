#!/bin/bash

# Test New Futures Features - Safe Read-Only Tests
# This script tests all new features without placing any real orders

echo "======================================"
echo "Testing New Futures Features (Safe)"
echo "======================================"
echo ""

# Load environment
source .env

# Test 1: Get Futures Account Info
echo "1. Testing get_futures_account_info..."
node dist/index.js << 'EOF'
{
  "method": "tools/call",
  "params": {
    "name": "get_futures_account_info",
    "arguments": {}
  }
}
EOF
echo ""

# Test 2: Get Futures Positions
echo "2. Testing get_futures_positions..."
node dist/index.js << 'EOF'
{
  "method": "tools/call",
  "params": {
    "name": "get_futures_positions",
    "arguments": {}
  }
}
EOF
echo ""

# Test 3: Get Futures Income History
echo "3. Testing get_futures_income_history..."
node dist/index.js << 'EOF'
{
  "method": "tools/call",
  "params": {
    "name": "get_futures_income_history",
    "arguments": {
      "limit": 10
    }
  }
}
EOF
echo ""

# Test 4: Get Futures ADL Quantile
echo "4. Testing get_futures_adl_quantile..."
node dist/index.js << 'EOF'
{
  "method": "tools/call",
  "params": {
    "name": "get_futures_adl_quantile",
    "arguments": {}
  }
}
EOF
echo ""

# Test 5: Get Futures Mark Price
echo "5. Testing get_futures_mark_price..."
node dist/index.js << 'EOF'
{
  "method": "tools/call",
  "params": {
    "name": "get_futures_mark_price",
    "arguments": {
      "symbol": "BTCUSDT"
    }
  }
}
EOF
echo ""

# Test 6: Get Futures Funding Rate
echo "6. Testing get_futures_funding_rate..."
node dist/index.js << 'EOF'
{
  "method": "tools/call",
  "params": {
    "name": "get_futures_funding_rate",
    "arguments": {
      "symbol": "BTCUSDT",
      "limit": 5
    }
  }
}
EOF
echo ""

# Test 7: Get Futures Long/Short Ratio
echo "7. Testing get_futures_long_short_ratio..."
node dist/index.js << 'EOF'
{
  "method": "tools/call",
  "params": {
    "name": "get_futures_long_short_ratio",
    "arguments": {
      "symbol": "BTCUSDT",
      "period": "1h",
      "limit": 5
    }
  }
}
EOF
echo ""

# Test 8: Get Futures Commission Rate
echo "8. Testing get_futures_commission_rate..."
node dist/index.js << 'EOF'
{
  "method": "tools/call",
  "params": {
    "name": "get_futures_commission_rate",
    "arguments": {
      "symbol": "BTCUSDT"
    }
  }
}
EOF
echo ""

echo "======================================"
echo "All Safe Tests Completed!"
echo "======================================"
