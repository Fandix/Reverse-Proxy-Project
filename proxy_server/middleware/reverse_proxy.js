const cache = require('../lib/cache');
const mime = require('mime');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');

const apiServers = [
  { url: 'http://localhost:3001', alive: true },
  { url: 'http://localhost:3002', alive: true },
]
let currentServerIndex = 0;

function getNextServer() {
  let initialIndex = currentServerIndex;

  do {
    let server = apiServers[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % apiServers.length;
    console.log(server)
    if (server.alive) {
      return server.url;
    }
  } while (currentServerIndex !== initialIndex);

  throw new Error('No available servers');
}

function healthCheck() {
  apiServers.forEach(async (server, index) => {
    try {
      res = await axios.get(`${server.url}`);
      server.alive = res.status === 200;
    } catch (error) {
      server.alive = false;
      console.log(`[Health Check] Server ${server.url} is down.`);
    }
  });
}

setInterval(healthCheck, 2000);

function reverse_proxy(req, res) {
  const cacheKey = req.url;
  const targetServer = getNextServer();
  console.log(`[Load Balancing] Forwarding to: ${targetServer}`);

  const proxyMiddleware = createProxyMiddleware({
    target: targetServer,
    changeOrigin: true,
    selfHandleResponse: true,  // 需要手動處理響應
    onProxyRes: (proxyRes, req, res) => {
      const dataBuffer = [];

      proxyRes.on('data', (chunk) => {
        dataBuffer.push(chunk);
      });

      proxyRes.on('end', async () => {
        const completeBuffer = Buffer.concat(dataBuffer);
        let contentType = proxyRes.headers['content-type'];

        // 如果沒有 content-type，動態推斷
        if (!contentType) {
          contentType = mime.getType(req.url) || 'application/octet-stream';
        }

        // 緩存響應
        await cache.set(cacheKey, { data: completeBuffer, contentType });

        // 設置標頭
        res.setHeader('Content-Type', contentType);
        if (contentType === 'text/html') {
          res.setHeader('Content-Disposition', 'inline');
        }

        // 發送響應
        res.end(completeBuffer);
      });
    },
    onError: (err, req, res) => {
      console.error(`[Proxy Error] ${err.message}`);
      if (!res.headersSent) {
        res.status(500).send('Proxy Error');
      }
    },
    logLevel: 'debug'
  });

  proxyMiddleware(req, res);
}

module.exports = reverse_proxy;