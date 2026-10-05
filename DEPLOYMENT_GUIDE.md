# Deployment Guide - PhishingMail on Render with MongoDB Atlas

## Overview
This guide will help you deploy the PhishingMail application to Render (free hosting) with MongoDB Atlas for data storage. This eliminates the ngrok intermediate page and provides direct access to the login page.

## Prerequisites
- GitHub account
- MongoDB Atlas account (free tier available)
- Render account (free tier available)

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Verify your email

### 1.2 Create a Cluster
1. Click **Build a Database**
2. Choose **M0 (Free)** cluster
3. Select a region closest to you (e.g., Singapore, Mumbai, or Oregon)
4. Name your cluster (e.g., `phishaware-cluster`)
5. Click **Create**

### 1.3 Create Database User
1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Enter username: `phishaware-admin` (or your choice)
5. Enter a strong password (save this - you'll need it later)
6. Set **Database User Privileges** to **Read and write to any database**
7. Click **Create User**

### 1.4 Configure Network Access
1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**
5. This is required for Render to connect to MongoDB Atlas

### 1.5 Get Connection String
1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** and version **6.0 or later**
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://phishaware-admin:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add `/phishaware` at the end to specify the database name:
   ```
   mongodb+srv://phishaware-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/phishaware?retryWrites=true&w=majority
   ```
8. Save this connection string - you'll need it for Render

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git Repository (if not already done)
```bash
cd PhishingMail
git init
git add .
git commit -m "Initial commit"
```

### 2.2 Create GitHub Repository
1. Go to https://github.com
2. Click **New repository**
3. Name it: `phishingmail` (or your choice)
4. Make it **Private** (recommended for security)
5. Click **Create repository**

### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/phishingmail.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Render

### 3.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Verify your email

### 3.2 Create New Web Service
1. Click **New +** in the top right
2. Select **Web Service**
3. Connect your GitHub account if prompted
4. Select your `phishingmail` repository
5. Render will automatically detect it's a Node.js app

### 3.3 Configure Web Service
**Name**: `phishingmail` (or your choice)

**Branch**: `main`

**Runtime**: `Node`

**Build Command**: `npm install`

**Start Command**: `node server.js`

**Instance Type**: `Free` (recommended for testing)

**Region**: Choose a region close to your MongoDB Atlas cluster

### 3.4 Add Environment Variables
Scroll down to **Environment Variables** and add:

1. **MONGODB_URI**
   - Paste your MongoDB Atlas connection string from Step 1.5
   - Example: `mongodb+srv://phishaware-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/phishaware?retryWrites=true&w=majority`

2. **BASE_URL**
   - Leave empty initially (Render will set this automatically)
   - After deployment, you can set it to: `https://phishingmail.onrender.com` (replace with your actual URL)

3. **PORT**
   - Value: `10000` (Render uses this port by default)

### 3.5 Deploy
1. Click **Create Web Service**
2. Wait for deployment to complete (2-5 minutes)
3. You'll see a live URL like: `https://phishingmail.onrender.com`

---

## Step 4: Verify Deployment

### 4.1 Check Application Status
1. Go to your Render dashboard
2. Click on your web service
3. Check the **Logs** tab to ensure no errors
4. Look for: `MongoDB Connected` and `PhishAware - Phishing Simulation Platform Running`

### 4.2 Test Direct Access
1. Open your Render URL: `https://phishingmail.onrender.com`
2. Try accessing the admin dashboard: `https://phishingmail.onrender.com/index.html`
3. Try the phishing page: `https://phishingmail.onrender.com/amazon/index.html`

### 4.3 Test Credential Capture
1. Visit: `https://phishingmail.onrender.com/track/click?token=test123`
2. Fill in the form and submit
3. Check MongoDB Atlas to verify data was stored:
   - Go to MongoDB Atlas → Database → Browse Collections
   - Look for `capturedcredentials` collection
   - You should see the submitted credentials

---

## Step 5: Update Email Links (Optional)

If you're sending test emails, update the tracking links to use your Render URL:

**Old (ngrok)**:
```
https://your-ngrok-url.ngrok-free.app/track/click?token=TOKEN
```

**New (Render)**:
```
https://phishingmail.onrender.com/track/click?token=TOKEN
```

---

## Important Notes

### Free Tier Limitations
- **Render Free Tier**: 
  - Spins down after 15 minutes of inactivity
  - Takes ~30 seconds to wake up on first request
  - 512 MB RAM limit
  
- **MongoDB Atlas Free Tier**:
  - 512 MB storage limit
  - Shared cluster (may have slight latency)
  - Suitable for testing and small projects

### Security Considerations
1. Keep your MongoDB password secure
2. Use environment variables - never hardcode credentials
3. Consider making your GitHub repository private
4. Regularly rotate database passwords
5. Monitor MongoDB Atlas for unusual activity

### Troubleshooting

**Issue**: Deployment fails
- Check Render logs for specific errors
- Ensure `package.json` has correct start script
- Verify MongoDB connection string is correct

**Issue**: MongoDB connection fails
- Verify IP whitelist includes 0.0.0.0/0
- Check database user credentials
- Ensure connection string includes database name

**Issue**: App spins down frequently
- This is normal for free tier
- Consider upgrading to paid tier for production
- Or use a cron job to keep it alive

---

## Alternative: Railway (Another Free Option)

If you prefer Railway instead of Render:

1. Go to https://railway.app
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Choose your repository
5. Railway will auto-detect Node.js
6. Add environment variables (MONGODB_URI, BASE_URL, PORT)
7. Deploy

Railway also offers a free tier with similar limitations.

---

## Next Steps

After successful deployment:
1. Test the full phishing simulation flow
2. Verify all data is stored in MongoDB Atlas
3. Check the admin dashboard at `/index.html`
4. Monitor activity logs in MongoDB Atlas
5. Share the direct Render URL with test users (no ngrok warning page!)

---

## Support

For issues:
- Render docs: https://render.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com
- Check application logs in Render dashboard
- Check MongoDB Atlas logs in Atlas dashboard
