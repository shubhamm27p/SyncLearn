const https = require('https');

const options = {
  hostname: 'sync-learn-updated.onrender.com',
  port: 443,
  path: '/api/mcq/tests',
  method: 'GET',
  headers: {
    'Origin': 'https://synclearn-osd4vkd4f-shubhamm27p.vercel.app'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log(`BODY: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
