import { ProxyAgent } from 'undici';

/**
 * Configure global fetch to use proxy if HTTPS_PROXY or HTTP_PROXY is set
 * This enables the binance-api-node library to work through proxies
 */
export function configureProxyForFetch(): void {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

  if (!proxyUrl) {
    return;
  }

  console.log(`Configuring global fetch to use proxy: ${proxyUrl}`);

  // Create a proxy agent for undici
  const proxyAgent = new ProxyAgent(proxyUrl);

  // Override global fetch to use the proxy agent
  const originalFetch = globalThis.fetch;

  globalThis.fetch = function (input: any, init?: any): Promise<Response> {
    const fetchInit = {
      ...init,
      dispatcher: proxyAgent,
    };

    return originalFetch(input, fetchInit);
  } as typeof fetch;
}
