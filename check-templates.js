const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/templates',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Templates from API:', data);
    const templates = JSON.parse(data);
    templates.forEach(t => {
      console.log('\n--- Template:', t.name);
      console.log('Has bodyText:', !!t.bodyText);
      console.log('bodyText length:', t.bodyText ? t.bodyText.length : 0);
      console.log('bodyHtml length:', t.bodyHtml ? t.bodyHtml.length : 0);
      if (t.bodyText) {
        console.log('bodyText preview:', t.bodyText.substring(0, 100));
      }
    });
  });
});

req.on('error', (err) => console.error('Error:', err.message));
req.end();
