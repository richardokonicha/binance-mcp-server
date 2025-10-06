#!/bin/bash
# Test Market Intelligence Tools (100% Safe - Read-Only)

echo "=== Testing Market Intelligence Tools ==="
echo ""

# Use testnet for safety
export BINANCE_TESTNET=true

# Test 1: Funding Rate
echo "1. Get BTCUSDT Funding Rate History..."
curl -s "https://testnet.binancefuture.com/fapi/v1/fundingRate?symbol=BTCUSDT&limit=5" | jq '.'
echo ""

# Test 2: Mark Price
echo "2. Get BTCUSDT Mark Price..."
curl -s "https://testnet.binancefuture.com/fapi/v1/premiumIndex?symbol=BTCUSDT" | jq '.'
echo ""

# Test 3: Long/Short Ratio
echo "3. Get BTCUSDT Long/Short Ratio..."
curl -s "https://testnet.binancefuture.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=1h&limit=5" | jq '.'
echo ""

# Test 4: Open Interest
echo "4. Get BTCUSDT Open Interest..."
curl -s "https://testnet.binancefuture.com/futures/data/openInterestHist?symbol=BTCUSDT&period=1h&limit=5" | jq '.'
echo ""

echo "=== All Market Intelligence Tests Complete ==="
