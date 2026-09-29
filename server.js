require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./src/config/db');

const trackRoutes = require('./src/routes/trackRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const Template = require('./src/models/Template');
const defaultTemplates = require('./src/data/defaultTemplates');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine for awareness education page
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// Static assets (Dashboard UI, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routes
app.use('/track', trackRoutes);
app.use('/api/admin', adminRoutes);

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
    console.log(`🛡️  PhishAware - Phishing Simulation Platform Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/index.html`);
    console.log(`=======================================================`);
  });
}

startServer();
