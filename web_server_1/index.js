const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

let serverCalls = 0;

app.use(express.static(path.join(__dirname, '../', 'public')));

app.get('/home', (req, res) => {
  serverCalls++;
  console.log(`Web server 1 has received ${serverCalls} calls`);
  res.sendFile(path.join(__dirname, '../', 'public', 'index.html'));
});

app.get('/img', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bear.jpg'));
});

app.listen(PORT, () => {
  console.log(`Web server 1 is running at http://localhost:${PORT}`);
});