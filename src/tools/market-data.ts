import {
  GetPriceSchema,
  GetOrderBookSchema,
  GetKlinesSchema,
  Get24hrTickerSchema,
  GetPriceInput,
  GetOrderBookInput,
  GetKlinesInput,
  Get24hrTickerInput,
} from '../types/mcp.js';
import { validateInput, validateSymbol } from '../utils/validation.js';
import { handleBinanceError } from '../utils/error-handling.js';

export const marketDataTools = [
  {
    name: 'get_price',
    description: 'Obtaineth the current price of a specified trading pair',
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
      const input = validateInput(GetPriceSchema, args);
      validateSymbol(input.symbol);

      try {
        const price = await binanceClient.prices({ symbol: input.symbol });
        return {
          symbol: input.symbol,
          price: price[input.symbol],
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_orderbook',
    description: 'Obtaineth the order book depth data',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Trading pair symbol, as BTCUSDT doth appear',
        },
        limit: {
          type: 'number',
          description: 'Depth limit, defaulting to a hundred entries',
          default: 100,
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetOrderBookSchema, args);
      validateSymbol(input.symbol);

      try {
        const orderBook = await binanceClient.book({
          symbol: input.symbol,
          limit: input.limit,
        });

        return {
          symbol: input.symbol,
          lastUpdateId: orderBook.lastUpdateId,
          bids: orderBook.bids.slice(0, input.limit).map((bid: any) => ({
            price: bid.price,
            quantity: bid.quantity,
          })),
          asks: orderBook.asks.slice(0, input.limit).map((ask: any) => ({
            price: ask.price,
            quantity: ask.quantity,
          })),
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_klines',
    description: 'Obtaineth the candlestick historical data',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Trading pair symbol, as BTCUSDT doth appear',
        },
        interval: {
          type: 'string',
          enum: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
          description: 'The interval of time\'s passage',
        },
        limit: {
          type: 'number',
          description: 'Quantity limit, defaulting to five hundred',
          default: 500,
        },
      },
      required: ['symbol', 'interval'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetKlinesSchema, args);
      validateSymbol(input.symbol);

      try {
        const klines = await binanceClient.candles({
          symbol: input.symbol,
          interval: input.interval,
          limit: input.limit,
        });

        return {
          symbol: input.symbol,
          interval: input.interval,
          data: klines.map((kline: any) => ({
            openTime: kline.openTime,
            open: kline.open,
            high: kline.high,
            low: kline.low,
            close: kline.close,
            volume: kline.volume,
            closeTime: kline.closeTime,
            quoteAssetVolume: kline.quoteAssetVolume,
            numberOfTrades: kline.numberOfTrades,
            takerBuyBaseAssetVolume: kline.takerBuyBaseAssetVolume,
            takerBuyQuoteAssetVolume: kline.takerBuyQuoteAssetVolume,
          })),
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_24hr_ticker',
    description: 'Obtaineth the 24-hour price change statistics',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Trading pair symbol, or all pairs if none be specified',
        },
      },
      required: [],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(Get24hrTickerSchema, args);
      
      if (input.symbol) {
        validateSymbol(input.symbol);
      }

      try {
        if (input.symbol) {
          const ticker = await binanceClient.dailyStats({ symbol: input.symbol });
          return {
            symbol: input.symbol,
            data: ticker,
            timestamp: Date.now(),
          };
        } else {
          const tickers = await binanceClient.dailyStats();
          return {
            data: Array.isArray(tickers) ? tickers : [tickers],
            timestamp: Date.now(),
          };
        }
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },
];