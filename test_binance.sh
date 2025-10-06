#!/usr/bin/env node

const Binance = require('binance-api-node').default;

const client = Binance({
  apiKey: 'QyrHrU4ol1uwIsbbEdRZp7pRCA9Kr08UkWuOLhqJnPy2mHYDyXSAvIoXshHKEENy',
  apiSecret: 'c0mZO7jt71lEwCnGflBnn9WM4kPUDL5nZcnO4NIm6yPmDIfT5Z3FunQaNmmEWnE2',
  httpBase: 'https://api.binance.com',
  getTime: () => Date.now(),
});

client.accountInfo()
  .then(info => {
    console.log('Success!');
    console.log('Can trade:', info.canTrade);
    console.log('Balances with funds:', info.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0));
  })
  .catch(err => {
    console.error('Error:', err.message);
    console.error('Code:', err.code);
    console.error('Full error:', err);
  });
