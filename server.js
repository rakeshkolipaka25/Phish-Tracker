require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
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
app.use(session({
  secret: process.env.SESSION_SECRET || 'phish-aware-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Simple password authentication middleware
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if ((auth && auth === `Bearer ${ADMIN_PASSWORD}`) || (req.session && req.session.authenticated)) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Session-based auth for dashboard HTML
const sessionAuthMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth === `Bearer ${ADMIN_PASSWORD}`) {
    next();
  } else if (req.session && req.session.authenticated) {
    next();
  } else {
    res.status(401).send(`
      <html>
        <head><title>Admin Login</title></head>
        <body style="font-family: Arial; padding: 50px; text-align: center;">
          <h2>Admin Dashboard Login</h2>
          <form method="POST" action="/login">
            <input type="password" name="password" placeholder="Password" style="padding: 10px; margin: 10px;">
            <button type="submit" style="padding: 10px;">Login</button>
          </form>
        </body>
      </html>
    `);
  }
};

// View engine for awareness education page
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// Static assets (Dashboard UI, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routes
app.use('/track', trackRoutes); // Public - for phishing page tracking
app.use('/api/admin', authMiddleware, adminRoutes); // Protected - requires auth

// Dashboard HTML protection
app.get('/index.html', sessionAuthMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login route
app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.redirect('/index.html');
  } else {
    res.status(401).send('Invalid password');
  }
});

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
