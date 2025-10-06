import {
  PlaceOrderSchema,
  CancelOrderSchema,
  CancelAllOrdersSchema,
  PlaceOrderInput,
  CancelOrderInput,
  CancelAllOrdersInput,
} from '../types/mcp.js';
import { validateInput, validateSymbol, validateQuantity, validatePrice } from '../utils/validation.js';
import { handleBinanceError } from '../utils/error-handling.js';
import { isTestnetEnabled, getNetworkMode } from '../config/binance.js';

function validateAndWarnMainnet(): string {
  const networkMode = getNetworkMode();
  if (networkMode === 'mainnet') {
    console.warn('⚠️  WARNING: Trading on MAINNET with REAL money! Double-check your orders before confirming.');
  }
  return networkMode;
}

export const tradingTools = [
  {
    name: 'place_order',
    description: 'Place an order for trade - supporteth both mainnet and testnet (mainnet shall employ real coin)',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Trading pair symbol, as BTCUSDT doth appear',
        },
        side: {
          type: 'string',
          enum: ['BUY', 'SELL'],
          description: 'Direction of thy trade, to buy or sell',
        },
        type: {
          type: 'string',
          enum: ['MARKET', 'LIMIT'],
          description: 'The manner of order placement',
        },
        quantity: {
          type: 'string',
          description: 'The quantity desired',
        },
        price: {
          type: 'string',
          description: 'The price, required for LIMIT orders most assuredly',
        },
      },
      required: ['symbol', 'side', 'type', 'quantity'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const networkMode = validateAndWarnMainnet();
      
      const input = validateInput(PlaceOrderSchema, args);
      validateSymbol(input.symbol);
      validateQuantity(input.quantity);

      if (input.type === 'LIMIT' && !input.price) {
        throw new Error('Price is required for LIMIT orders');
      }

      if (input.price) {
        validatePrice(input.price);
      }

      try {
        const orderParams: any = {
          symbol: input.symbol,
          side: input.side,
          type: input.type,
          quantity: input.quantity,
        };

        if (input.type === 'LIMIT' && input.price) {
          orderParams.price = input.price;
          orderParams.timeInForce = 'GTC';
        }

        const orderResult = await binanceClient.order(orderParams);

        return {
          symbol: orderResult.symbol,
          orderId: orderResult.orderId,
          orderListId: orderResult.orderListId,
          clientOrderId: orderResult.clientOrderId,
          transactTime: orderResult.transactTime,
          price: orderResult.price,
          origQty: orderResult.origQty,
          executedQty: orderResult.executedQty,
          cummulativeQuoteQty: orderResult.cummulativeQuoteQty,
          status: orderResult.status,
          timeInForce: orderResult.timeInForce,
          type: orderResult.type,
          side: orderResult.side,
          fills: orderResult.fills || [],
          timestamp: Date.now(),
          network: networkMode,
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'cancel_order',
    description: 'Cancel a specified order - supporteth both mainnet and testnet',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Trading pair symbol, as BTCUSDT doth appear',
        },
        orderId: {
          type: 'number',
          description: 'The order\'s identification number',
        },
      },
      required: ['symbol', 'orderId'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const networkMode = validateAndWarnMainnet();
      
      const input = validateInput(CancelOrderSchema, args);
      validateSymbol(input.symbol);

      try {
        const cancelResult = await binanceClient.cancelOrder({
          symbol: input.symbol,
          orderId: input.orderId,
        });

        return {
          symbol: cancelResult.symbol,
          origClientOrderId: cancelResult.origClientOrderId,
          orderId: cancelResult.orderId,
          orderListId: cancelResult.orderListId,
          clientOrderId: cancelResult.clientOrderId,
          price: cancelResult.price,
          origQty: cancelResult.origQty,
          executedQty: cancelResult.executedQty,
          cummulativeQuoteQty: cancelResult.cummulativeQuoteQty,
          status: cancelResult.status,
          timeInForce: cancelResult.timeInForce,
          type: cancelResult.type,
          side: cancelResult.side,
          timestamp: Date.now(),
          network: networkMode,
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'cancel_all_orders',
    description: 'Cancel all pending orders for a specified trading pair - supporteth both mainnet and testnet',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Trading pair symbol, as BTCUSDT doth appear',
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const networkMode = validateAndWarnMainnet();
      
      const input = validateInput(CancelAllOrdersSchema, args);
      validateSymbol(input.symbol);

      try {
        const cancelResults = await binanceClient.cancelOpenOrders({
          symbol: input.symbol,
        });

        return {
          symbol: input.symbol,
          cancelledOrders: Array.isArray(cancelResults) ? cancelResults.map((result: any) => ({
            symbol: result.symbol,
            origClientOrderId: result.origClientOrderId,
            orderId: result.orderId,
            orderListId: result.orderListId,
            clientOrderId: result.clientOrderId,
            price: result.price,
            origQty: result.origQty,
            executedQty: result.executedQty,
            cummulativeQuoteQty: result.cummulativeQuoteQty,
            status: result.status,
            timeInForce: result.timeInForce,
            type: result.type,
            side: result.side,
          })) : [cancelResults],
          count: Array.isArray(cancelResults) ? cancelResults.length : 1,
          timestamp: Date.now(),
          network: networkMode,
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },
];