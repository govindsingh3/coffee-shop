import http from 'http';

// Test payload
const payload = JSON.stringify({
  items: [{ drinkType: 'latte', quantity: 1 }],
  isRegular: false
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.write(payload);
req.end();
