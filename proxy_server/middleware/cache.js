const cache = require('../lib/cache');

async function checkCache(req, res, next) {
  const cachedData = await cache.get(req.url);
  if (cachedData) {
    const originalUserAgent = req.headers['user-agent'] || 'Unknown User-Agent';
    console.log(`[Proxy Server] Request from: ${originalUserAgent}`);
    console.log(`[Cache Hit] ${req.url}`);
    res.setHeader('Content-Type', cachedData.contentType);

    if (cachedData.contentType === 'text/html') {
        res.setHeader('Content-Disposition', 'inline');
    }

    res.end(cachedData.data);
    return;
  } else {
    next();
  }
}

module.exports = checkCache;