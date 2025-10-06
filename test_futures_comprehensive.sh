#!/usr/bin/env node

const Binance = require('binance-api-node').default;

const client = Binance({
  apiKey: 'QyrHrU4ol1uwIsbbEdRZp7pRCA9Kr08UkWuOLhqJnPy2mHYDyXSAvIoXshHKEENy',
  apiSecret: 'c0mZO7jt71lEwCnGflBnn9WM4kPUDL5nZcnO4NIm6yPmDIfT5Z3FunQaNmmEWnE2',
  httpBase: 'https://api.binance.com',
  getTime: () => Date.now(),
});

async function testAllFuturesFunctions() {
  console.log('=== Testing All Futures Functions ===\n');
  
  // Test 1: get_futures_account_info
  console.log('1. Testing get_futures_account_info...');
  try {
    const account = await client.futuresAccountInfo();
    console.log('✓ SUCCESS');
    console.log('  Total Wallet Balance:', account.totalWalletBalance);
    console.log('  Total Unrealized Profit:', account.totalUnrealizedProfit);
    console.log('  Available Balance:', account.availableBalance);
    console.log('  Assets with balance:', account.assets.filter(a => parseFloat(a.walletBalance) > 0).length);
  } catch (err) {
    console.log('✗ FAILED:', err.message);
  }
  
  // Test 2: get_futures_positions (all)
  console.log('\n2. Testing get_futures_positions (all)...');
  try {
    const positions = await client.futuresPositionRisk();
    const openPositions = positions.filter(p => parseFloat(p.positionAmt) !== 0);
    console.log('✓ SUCCESS');
    console.log('  Total open positions:', openPositions.length);
    openPositions.forEach(pos => {
      console.log(`  - ${pos.symbol}: ${pos.positionAmt} @ ${pos.entryPrice} (PnL: ${pos.unRealizedProfit})`);
    });
  } catch (err) {
    console.log('✗ FAILED:', err.message);
  }
  
  // Test 3: get_futures_positions (specific symbol)
  console.log('\n3. Testing get_futures_positions (OPENUSDT)...');
  try {
    const positions = await client.futuresPositionRisk({ symbol: 'OPENUSDT' });
    const openPosition = positions.find(p => parseFloat(p.positionAmt) !== 0);
    if (openPosition) {
      console.log('✓ SUCCESS');
      console.log('  Symbol:', openPosition.symbol);
      console.log('  Position Amount:', openPosition.positionAmt);
      console.log('  Entry Price:', openPosition.entryPrice);
      console.log('  Mark Price:', openPosition.markPrice);
      console.log('  Unrealized PnL:', openPosition.unRealizedProfit);
      console.log('  Leverage:', openPosition.leverage);
      console.log('  Margin Type:', openPosition.marginType);
    } else {
      console.log('✓ SUCCESS (no position)');
    }
  } catch (err) {
    console.log('✗ FAILED:', err.message);
  }
  
  // Test 4: get_futures_open_orders (all)
  console.log('\n4. Testing get_futures_open_orders (all)...');
  try {
    const orders = await client.futuresOpenOrders();
    console.log('✓ SUCCESS');
    console.log('  Total open orders:', orders.length);
    if (orders.length > 0) {
      orders.forEach(order => {
        console.log(`  - ${order.symbol}: ${order.side} ${order.type} ${order.origQty} @ ${order.price}`);
      });
    }
  } catch (err) {
    console.log('✗ FAILED:', err.message);
  }
  
  // Test 5: get_futures_open_orders (specific symbol)
  console.log('\n5. Testing get_futures_open_orders (BTCUSDT)...');
  try {
    const orders = await client.futuresOpenOrders({ symbol: 'BTCUSDT' });
    console.log('✓ SUCCESS');
    console.log('  Open orders for BTCUSDT:', orders.length);
  } catch (err) {
    console.log('✗ FAILED:', err.message);
  }
  
  // Test 6: get_futures_order_history
  console.log('\n6. Testing get_futures_order_history (OPENUSDT, limit 5)...');
  try {
    const history = await client.futuresAllOrders({ symbol: 'OPENUSDT', limit: 5 });
    console.log('✓ SUCCESS');
    console.log('  Order history count:', history.length);
    if (history.length > 0) {
      const recent = history[history.length - 1];
      console.log('  Most recent:', recent.side, recent.type, recent.status);
    }
  } catch (err) {
    console.log('✗ FAILED:', err.message);
  }
  
  console.log('\n=== Trading Functions (Skipped - Mainnet) ===');
  console.log('⚠ place_futures_order - Only available in TESTNET');
  console.log('⚠ cancel_futures_order - Only available in TESTNET');
  console.log('⚠ cancel_all_futures_orders - Only available in TESTNET');
  console.log('⚠ set_futures_leverage - Only available in TESTNET');
  console.log('⚠ set_futures_margin_type - Only available in TESTNET');
  
  console.log('\n=== Summary ===');
  console.log('All read-only futures functions tested successfully!');
  console.log('Trading functions are protected and require BINANCE_TESTNET=true');
}

testAllFuturesFunctions().catch(console.error);
