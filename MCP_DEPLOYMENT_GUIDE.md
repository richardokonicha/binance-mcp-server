# MCP Server Deployment Guide

This guide shows you how to deploy your MCP servers to a remote server so you can use them with Claude Desktop and Claude Code from anywhere.

## Current MCP Configuration

Your current Claude Desktop MCP configuration includes **2 MCP servers**:

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": [
        "/Users/ro/Fugoku/binance-mcp-server/dist/index.js"
      ],
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
      "type": "streamable-http",
      "url": "https://app.affine.pro/api/workspaces/bc1da90b-e71c-4034-b47d-6e3b9a0f10ff/mcp",
      "headers": {
        "Authorization": "Bearer ut_ec687ead76ba5f317499cd242e6f2bda27ba1"
      }
    }
  }
}
```

## Your MCP Servers Overview

### 1. Binance MCP Server (Local/Stdio)
- **Type**: Local executable (stdio transport)
- **Tools**: 38 trading and market data tools
- **Features**: Spot trading, futures, market data, account management
- **Deployment**: Can be deployed to remote server via SSH
- **Proxy**: Configured with Bright Data proxy for global access

### 2. AFFiNE MCP Server (Remote/HTTP)
- **Type**: Remote HTTP (streamable-http transport)
- **Tools**: 30+ document and workspace tools
- **Features**: Document management, collaboration, version control
- **Deployment**: Already cloud-hosted by AFFiNE
- **Connection**: Direct HTTPS to app.affine.pro

## Option 1: Direct SSH Connection (Recommended for Development)

This approach allows Claude Desktop to connect to your remote MCP server via SSH.

### On Your Remote Server:

1. **Upload the MCP server:**
   ```bash
   # From your local machine
   scp -r /Users/ro/Fugoku/binance-mcp-server user@your-server:/home/user/
   ```

2. **SSH into your server and install dependencies:**
   ```bash
   ssh user@your-server
   cd /home/user/binance-mcp-server
   npm install
   npm run build
   ```

3. **Create .env file on server:**
   ```bash
   cat > .env << 'EOF'
   BINANCE_API_KEY=QyrHrU4ol1uwIsbbEdRZp7pRCA9Kr08UkWuOLhqJnPy2mHYDyXSAvIoXshHKEENy
   BINANCE_API_SECRET=c0mZO7jt71lEwCnGflBnn9WM4kPUDL5nZcnO4NIm6yPmDIfT5Z3FunQaNmmEWnE2
   BINANCE_TESTNET=false
   HTTPS_PROXY=http://brd-customer-hl_4c630022-zone-dbp:qv0dto7628fb@brd.superproxy.io:33335
   HTTP_PROXY=http://brd-customer-hl_4c630022-zone-dbp:qv0dto7628fb@brd.superproxy.io:33335
   MCP_SERVER_NAME=binance-mcp-server
   MCP_SERVER_VERSION=1.1.1
   LOG_LEVEL=info
   EOF
   ```

### On Your Local Machine (Claude Desktop):

Update your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "binance-mcp-server-remote": {
      "command": "ssh",
      "args": [
        "user@your-server",
        "cd /home/user/binance-mcp-server && node dist/index.js"
      ],
      "env": {}
    }
  }
}
```

**Note:** Environment variables will be loaded from the `.env` file on the remote server.

## Option 2: Docker Deployment with MCP-over-HTTP

This approach runs the MCP server as an HTTP service using Docker on your remote server.

### Step 1: Deploy to Remote Server

```bash
# From your local machine
cd /Users/ro/Fugoku/binance-mcp-server
scp -r . user@your-server:/home/user/binance-mcp-server/

# SSH into server
ssh user@your-server
cd /home/user/binance-mcp-server

# Create .env file (same as above)
# Then deploy with Docker Compose
docker-compose up -d
```

### Step 2: Set up MCP-over-HTTP Adapter

You'll need an MCP-to-HTTP bridge. Create a new file `mcp-http-bridge.js`:

```javascript
import express from 'express';
import { spawn } from 'child_process';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let mcpProcess = spawn('node', ['dist/index.js'], {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe']
});

app.post('/mcp', async (req, res) => {
  mcpProcess.stdin.write(JSON.stringify(req.body) + '\n');

  mcpProcess.stdout.once('data', (data) => {
    res.json(JSON.parse(data.toString()));
  });
});

app.listen(PORT, () => {
  console.log(`MCP HTTP bridge listening on port ${PORT}`);
});
```

### Step 3: Update Claude Desktop Config

```json
{
  "mcpServers": {
    "binance-mcp-server-remote": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/client-http",
        "http://your-server:3000/mcp"
      ]
    }
  }
}
```

## Option 3: Use MCP SSE (Server-Sent Events) Transport

The MCP protocol supports SSE for remote connections. This is the most production-ready approach.

### On Remote Server:

1. **Create SSE server wrapper** (`sse-server.js`):

```javascript
import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { BinanceMCPServer } from './dist/server.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/sse', async (req, res) => {
  const transport = new SSEServerTransport('/message', res);
  const server = new BinanceMCPServer();

  await server.connect(transport);
});

app.post('/message', express.json(), async (req, res) => {
  // Handle MCP messages
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`MCP SSE server on port ${PORT}`);
});
```

2. **Update package.json:**
```json
{
  "scripts": {
    "start:sse": "node sse-server.js"
  }
}
```

3. **Deploy:**
```bash
npm run build
npm run start:sse
```

### On Local Machine:

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "url": "http://your-server:3000/sse",
      "transport": "sse"
    }
  }
}
```

## Option 4: Simple rsync + Local Execution (Easiest)

Just sync the server to your remote machine and run it locally when you SSH in:

```bash
# Sync to server
rsync -avz --exclude node_modules /Users/ro/Fugoku/binance-mcp-server/ user@your-server:/home/user/binance-mcp-server/

# On server
cd /home/user/binance-mcp-server
npm install
npm run build

# Keep using local config, but SSH in when you want to use it remotely
```

## Security Considerations

1. **Never commit API keys to git** - Use environment variables or .env files
2. **Use SSH key authentication** for remote access
3. **Consider using a VPN** or SSH tunnel for the HTTP/SSE approaches
4. **Rotate your API keys** regularly
5. **Use HTTPS** if exposing the MCP server over HTTP
6. **Firewall rules** - Only allow connections from trusted IPs

## Recommended Approach

For your use case, I recommend **Option 1 (SSH)** because:
- No need for additional HTTP layer
- Secure by default (SSH encryption)
- Simple setup
- No additional dependencies
- Works with existing MCP protocol

## Testing the Deployment

After setting up, test with:

```bash
# On remote server
cd /home/user/binance-mcp-server
npm run dev

# You should see:
# Configuring global fetch to use proxy: http://brd-customer-hl_4c630022-zone-dbp...
# Using proxy: http://brd-customer-hl_4c630022-zone-dbp...
# Binance MCP Server started with 38 tools
```

Then restart Claude Desktop and verify the MCP server shows up in the available tools.
