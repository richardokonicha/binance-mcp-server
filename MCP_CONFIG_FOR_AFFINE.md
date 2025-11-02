# MCP Servers Configuration

## Complete Configuration

### Claude Desktop
**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": ["/Users/ro/Fugoku/binance-mcp-server/dist/index.js"],
      "env": {
        "BINANCE_API_KEY": "QyrHrU4ol1uwIsbbEdRZp7pRCA9Kr08UkWuOLhqJnPy2mHYDyXSAvIoXshHKEENy",
        "BINANCE_API_SECRET": "c0mZO7jt71lEwCnGflBnn9WM4kPUDL5nZcnO4NIm6yPmDIfT5Z3FunQaNmmEWnE2",
        "BINANCE_TESTNET": "false",
        "HTTPS_PROXY": "http://brd-customer-hl_4c630022-zone-dbp:qv0dto7628fb@brd.superproxy.io:33335",
        "HTTP_PROXY": "http://brd-customer-hl_4c630022-zone-dbp:qv0dto7628fb@brd.superproxy.io:33335",
        "MCP_SERVER_NAME": "binance-mcp-server",
        "MCP_SERVER_VERSION": "1.1.1",
        "LOG_LEVEL": "info"
      }
    },
    "affine-mcp-server": {
      "command": "npx",
      "args": ["-y", "affine-mcp-server"],
      "env": {
        "AFFINE_BASE_URL": "https://app.affine.pro",
        "AFFINE_API_TOKEN": "ut_ec687ead76ba5f317499cd242e6f2bda27ba1"
      }
    }
  },
  "preferences": {
    "quickEntryDictationShortcut": "capslock"
  }
}
```

### Claude Code
**Location**: `~/.claude.json` (project-specific)
**Setup**: `claude mcp add affine-mcp-server --env AFFINE_BASE_URL=https://app.affine.pro --env AFFINE_API_TOKEN=ut_ec687ead76ba5f317499cd242e6f2bda27ba1 -- npx -y affine-mcp-server`

Both MCP servers are configured in Claude Code for this project (binance-mcp-server directory).

## MCP Servers

### 1. Binance MCP (38 tools)
- **Type**: Local stdio server
- **Path**: `/Users/ro/Fugoku/binance-mcp-server/dist/index.js`
- **Features**: Trading, market data, futures, account management
- **Proxy**: Bright Data (required for global access)
- **Mode**: Mainnet (real funds)

**Tools**: get_price, get_orderbook, get_klines, get_24hr_ticker, get_account_info, get_open_orders, get_order_history, place_order, cancel_order, cancel_all_orders, get_futures_account_info, get_futures_positions, get_futures_open_orders, get_futures_order_history, place_futures_order, cancel_futures_order, set_futures_leverage, set_futures_margin_type, place_futures_stop_loss, place_futures_take_profit, close_futures_position, place_futures_bracket_order, and more.

### 2. AFFiNE MCP (30+ tools)
- **Type**: Cloud-hosted HTTP server
- **Instance**: app.affine.pro
- **Workspace**: bc1da90b-e71c-4034-b47d-6e3b9a0f10ff
- **Features**: Documents, collaboration, version control, file storage

**Tools**: Document CRUD, search, comments, version history, user profiles, notifications, blob storage.

## Deployment

### Remote Server Setup
```bash
# Deploy Binance MCP
export REMOTE_USER="username"
export REMOTE_HOST="server.com"
./deploy-to-server.sh

# SSH config for Claude Desktop
{
  "binance-mcp-server-remote": {
    "command": "ssh",
    "args": ["user@server.com", "cd /path && node dist/index.js"]
  }
}
```

## Environment Files

### Binance .env
```bash
BINANCE_API_KEY=QyrHrU4ol1uwIsbbEdRZp7pRCA9Kr08UkWuOLhqJnPy2mHYDyXSAvIoXshHKEENy
BINANCE_API_SECRET=c0mZO7jt71lEwCnGflBnn9WM4kPUDL5nZcnO4NIm6yPmDIfT5Z3FunQaNmmEWnE2
BINANCE_TESTNET=false
HTTPS_PROXY=http://brd-customer-hl_4c630022-zone-dbp:qv0dto7628fb@brd.superproxy.io:33335
HTTP_PROXY=http://brd-customer-hl_4c630022-zone-dbp:qv0dto7628fb@brd.superproxy.io:33335
MCP_SERVER_NAME=binance-mcp-server
MCP_SERVER_VERSION=1.1.1
LOG_LEVEL=info
```

## Quick Commands

### Binance
- "Get BTC price"
- "Show futures positions"
- "Get account balance"
- "Place limit order: buy 0.01 BTC at $50000"

### AFFiNE
- "List AFFiNE documents"
- "Create document 'Trading Journal'"
- "Search docs for 'strategy'"

## Troubleshooting

### Logs
```bash
tail -f ~/Library/Logs/Claude/mcp-server-binance-mcp-server.log
tail -f ~/Library/Logs/Claude/mcp-server-affine-mcp-server.log
```

### Common Fixes
- **fetch failed**: Check proxy in .env
- **Unauthorized**: Verify API keys/tokens
- **Not showing**: Restart Claude Desktop (Cmd+Q)
- **Config error**: Validate JSON syntax

## Security
- ✅ API keys in environment variables
- ✅ Proxy configured
- ⚠️ Mainnet mode (real funds)
- 📝 Rotate tokens regularly
- 📝 Monitor logs for unusual activity
