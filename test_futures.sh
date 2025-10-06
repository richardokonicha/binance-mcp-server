#!/usr/bin/env node

const Binance = require('binance-api-node').default;

const client = Binance({
  apiKey: 'QyrHrU4ol1uwIsbbEdRZp7pRCA9Kr08UkWuOLhqJnPy2mHYDyXSAvIoXshHKEENy',
  apiSecret: 'c0mZO7jt71lEwCnGflBnn9WM4kPUDL5nZcnO4NIm6yPmDIfT5Z3FunQaNmmEWnE2',
  httpBase: 'https://api.binance.com',
  getTime: () => Date.now(),
});

async function testFutures() {
  console.log('=== Testing Futures Account ===\n');
  
  // Test futures account info
  try {
    const futuresAccount = await client.futuresAccountInfo();
    console.log('✓ Futures Account Info:');
    console.log('  Total Wallet Balance:', futuresAccount.totalWalletBalance);
    console.log('  Total Unrealized Profit:', futuresAccount.totalUnrealizedProfit);
    console.log('  Available Balance:', futuresAccount.availableBalance);
    console.log('  Assets:', futuresAccount.assets.filter(a => parseFloat(a.walletBalance) > 0));
  } catch (err) {
    console.log('✗ Futures account failed:', err.message);
  }
  
  // Test open positions
  try {
    const positions = await client.futuresPositionRisk();
    const openPositions = positions.filter(p => parseFloat(p.positionAmt) !== 0);
    console.log('\n✓ Open Positions:', openPositions.length);
    openPositions.forEach(pos => {
      console.log(`  ${pos.symbol}:`);
      console.log(`    Position: ${pos.positionAmt} (${parseFloat(pos.positionAmt) > 0 ? 'LONG' : 'SHORT'})`);
      console.log(`    Entry Price: ${pos.entryPrice}`);
      console.log(`    Mark Price: ${pos.markPrice}`);
      console.log(`    Unrealized PnL: ${pos.unRealizedProfit}`);
      console.log(`    Leverage: ${pos.leverage}x`);
    });
  } catch (err) {
    console.log('✗ Futures positions failed:', err.message);
  }
  
  // Test open orders
  try {
    const openOrders = await client.futuresOpenOrders();
    console.log('\n✓ Open Futures Orders:', openOrders.length);
    if (openOrders.length > 0) {
      console.log(openOrders);
    }
  } catch (err) {
    console.log('✗ Futures open orders failed:', err.message);
  }
}

testFutures().catch(console.error);
