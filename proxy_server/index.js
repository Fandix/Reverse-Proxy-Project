const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const checkCache = require('./middleware/cache');
const reverse_proxy = require('./middleware/reverse_proxy');

const app = express();
const PORT = 3000;

// 使用 morgan 中間件記錄每個請求的日誌
app.use(morgan('combined'));

// 檢查並返回緩存的響應
// app.use('/', checkCache);

// 使用 reverse proxy middleware
app.use('/', reverse_proxy);

app.listen(PORT, () => {
  console.log(`Reverse Proxy Server with Load Balancing running at http://localhost:${PORT}`);
});