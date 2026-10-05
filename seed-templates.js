const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/seed-defaults',
  method: 'POST'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (err) => console.error('Error:', err.message));
req.end();
