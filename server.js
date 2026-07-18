const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Endpoints
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('--- New Contact Request ---');
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Message: ${message}`);
  console.log('---------------------------\n');
  
  res.json({ status: 'success', message: 'Message received' });
});

app.post('/api/leads', (req, res) => {
  const { email, source } = req.body;
  console.log('--- New Lead Capture ---');
  console.log(`Email: ${email}`);
  console.log(`Source: ${source}`);
  console.log('------------------------\n');
  
  res.json({ status: 'success', message: 'Lead captured' });
});

app.post('/api/enroll', (req, res) => {
  const { plan } = req.body;
  console.log('--- New Enrollment Intent ---');
  console.log(`Plan: ${plan}`);
  console.log('-----------------------------\n');
  
  res.json({ status: 'success', message: `Enrollment intent for ${plan} logged` });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
