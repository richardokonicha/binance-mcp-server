#!/usr/bin/env node

const Binance = require('binance-api-node').default;

const client = Binance({
  apiKey: 'QyrHrU4ol1uwIsbbEdRZp7pRCA9Kr08UkWuOLhqJnPy2mHYDyXSAvIoXshHKEENy',
  apiSecret: 'c0mZO7jt71lEwCnGflBnn9WM4kPUDL5nZcnO4NIm6yPmDIfT5Z3FunQaNmmEWnE2',
  httpBase: 'https://api.binance.com',
  getTime: () => Date.now(),
});

async function testAll() {
  console.log('=== Testing Market Data Functions ===\n');
  
  // Test 1: get_price
  try {
    const price = await client.prices({ symbol: 'BTCUSDT' });
    console.log('✓ get_price (BTCUSDT):', price);
  } catch (err) {
    console.log('✗ get_price failed:', err.message);
  }
  
  // Test 2: get_orderbook
  try {
    const orderbook = await client.book({ symbol: 'BTCUSDT', limit: 5 });
    console.log('✓ get_orderbook (BTCUSDT):', { bids: orderbook.bids.slice(0, 2), asks: orderbook.asks.slice(0, 2) });
  } catch (err) {
    console.log('✗ get_orderbook failed:', err.message);
  }
  
  // Test 3: get_klines
  try {
    const klines = await client.candles({ symbol: 'BTCUSDT', interval: '1h', limit: 2 });
    console.log('✓ get_klines (BTCUSDT):', klines.slice(0, 1));
  } catch (err) {
    console.log('✗ get_klines failed:', err.message);
  }
  
  // Test 4: get_24hr_ticker
  try {
    const ticker = await client.dailyStats({ symbol: 'BTCUSDT' });
    console.log('✓ get_24hr_ticker (BTCUSDT):', { symbol: ticker.symbol, priceChange: ticker.priceChange, volume: ticker.volume });
  } catch (err) {
    console.log('✗ get_24hr_ticker failed:', err.message);
  }
  
  console.log('\n=== Testing Account Functions ===\n');
  
  // Test 5: get_account_info
  try {
    const account = await client.accountInfo();
    const balances = account.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
    console.log('✓ get_account_info:', { canTrade: account.canTrade, balancesCount: balances.length });
  } catch (err) {
    console.log('✗ get_account_info failed:', err.message);
  }
  
  // Test 6: get_open_orders
  try {
    const openOrders = await client.openOrders();
    console.log('✓ get_open_orders (all):', { count: openOrders.length });
  } catch (err) {
    console.log('✗ get_open_orders failed:', err.message);
  }
  
  // Test 7: get_order_history
  try {
    const orderHistory = await client.allOrders({ symbol: 'BTCUSDT', limit: 5 });
    console.log('✓ get_order_history (BTCUSDT):', { count: orderHistory.length });
  } catch (err) {
    console.log('✗ get_order_history failed:', err.message);
  }
  
  console.log('\n=== Testing Trading Functions ===\n');
  
  console.log('⚠ Skipping trading functions (place_order, cancel_order, cancel_all_orders)');
  console.log('  These should only be tested in testnet mode to avoid real trades');
  
  console.log('\n=== All Tests Complete ===');
}

testAll().catch(console.error);
