import { marketDataTools } from './market-data.js';
import { accountTools } from './account.js';
import { tradingTools } from './trading.js';
import { futuresTools } from './futures.js';

export { marketDataTools, accountTools, tradingTools, futuresTools };

export const getAllTools = () => {
  return [
    ...marketDataTools,
    ...accountTools,
    ...tradingTools,
    ...futuresTools,
  ];
};