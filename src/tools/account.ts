import {
  GetAccountInfoSchema,
  GetOpenOrdersSchema,
  GetOrderHistorySchema,
} from '../types/mcp.js';
import { validateInput, validateSymbol } from '../utils/validation.js';
import { handleBinanceError } from '../utils/error-handling.js';

export const accountTools = [
  {
    name: 'get_account_info',
    description: 'Obtaineth account information and balances',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async (binanceClient: any, args: unknown) => {
      validateInput(GetAccountInfoSchema, args);

      try {
        const accountInfo = await binanceClient.accountInfo();
        
        return {
          makerCommission: accountInfo.makerCommission,
          takerCommission: accountInfo.takerCommission,
          buyerCommission: accountInfo.buyerCommission,
          sellerCommission: accountInfo.sellerCommission,
          canTrade: accountInfo.canTrade,
          canWithdraw: accountInfo.canWithdraw,
          canDeposit: accountInfo.canDeposit,
          updateTime: accountInfo.updateTime,
          accountType: accountInfo.accountType,
          permissions: accountInfo.permissions,
          balances: accountInfo.balances
            .filter((balance: any) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
            .map((balance: any) => ({
              asset: balance.asset,
              free: balance.free,
              locked: balance.locked,
              total: (parseFloat(balance.free) + parseFloat(balance.locked)).toString(),
            })),
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_open_orders',
    description: 'Obtaineth the current pending orders',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Orders pending for a specific trading pair, or all if none be specified',
        },
      },
      required: [],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetOpenOrdersSchema, args);
      
      if (input.symbol) {
        validateSymbol(input.symbol);
      }

      try {
        const openOrders = await binanceClient.openOrders(
          input.symbol ? { symbol: input.symbol } : {}
        );

        return {
          symbol: input.symbol || 'ALL',
          orders: openOrders.map((order: any) => ({
            symbol: order.symbol,
            orderId: order.orderId,
            orderListId: order.orderListId,
            clientOrderId: order.clientOrderId,
            price: order.price,
            origQty: order.origQty,
            executedQty: order.executedQty,
            cummulativeQuoteQty: order.cummulativeQuoteQty,
            status: order.status,
            timeInForce: order.timeInForce,
            type: order.type,
            side: order.side,
            stopPrice: order.stopPrice,
            icebergQty: order.icebergQty,
            time: order.time,
            updateTime: order.updateTime,
            isWorking: order.isWorking,
            origQuoteOrderQty: order.origQuoteOrderQty,
          })),
          count: openOrders.length,
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_order_history',
    description: 'Obtaineth the historical order records',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Trading pair symbol, as BTCUSDT doth appear',
        },
        limit: {
          type: 'number',
          description: 'Quantity limit, defaulting to five hundred',
          default: 500,
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetOrderHistorySchema, args);
      validateSymbol(input.symbol);

      try {
        const orderHistory = await binanceClient.allOrders({
          symbol: input.symbol,
          limit: input.limit,
        });

        return {
          symbol: input.symbol,
          orders: orderHistory.map((order: any) => ({
            symbol: order.symbol,
            orderId: order.orderId,
            orderListId: order.orderListId,
            clientOrderId: order.clientOrderId,
            price: order.price,
            origQty: order.origQty,
            executedQty: order.executedQty,
            cummulativeQuoteQty: order.cummulativeQuoteQty,
            status: order.status,
            timeInForce: order.timeInForce,
            type: order.type,
            side: order.side,
            stopPrice: order.stopPrice,
            icebergQty: order.icebergQty,
            time: order.time,
            updateTime: order.updateTime,
            isWorking: order.isWorking,
            origQuoteOrderQty: order.origQuoteOrderQty,
          })),
          count: orderHistory.length,
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },
];