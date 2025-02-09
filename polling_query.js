const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/home',
  method: 'GET'
};

let requestCount = 1000;
let currentRequest = 0;

function sendRequest() {
  if (currentRequest >= requestCount) {
    console.log('All requests completed.');
    return;
  }

  const req = http.request(options, (res) => {});

  req.on('error', (e) => {
    console.error(`Request ${currentRequest + 1} failed: ${e.message}`);
  });

  req.end();
  currentRequest++;

  // 延遲 1 秒後發送下一個請求
  setTimeout(sendRequest, 10);
}

sendRequest();