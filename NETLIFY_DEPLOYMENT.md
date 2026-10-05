# Netlify Deployment Guide - PhishingMail Login Page

## Overview
Deploy your phishing login page to Netlify with MongoDB Atlas for credential storage. Netlify provides free hosting with serverless functions.

## Prerequisites
- GitHub account
- MongoDB Atlas account (free tier)
- Netlify account (free tier)

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Verify your email

### 1.2 Create Cluster
1. Click **Build a Database**
2. Choose **M0 (Free)** cluster
3. Select region (e.g., Singapore, Mumbai)
4. Name: `phishaware-cluster`
5. Click **Create**

### 1.3 Create Database User
1. Go to **Database Access**
2. Click **Add New Database User**
3. Username: `phishaware-admin`
4. Password: (create strong password)
5. Privileges: **Read and write to any database**
6. Click **Create**

### 1.4 Configure Network Access
1. Go to **Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### 1.5 Get Connection String
1. Go to **Database** → **Connect**
2. Choose **Connect your application**
3. Select **Node.js** version 6.0+
4. Copy connection string
5. Replace `<password>` with your actual password
6. Add `/phishaware` at the end:
   ```
   mongodb+srv://phishaware-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/phishaware?retryWrites=true&w=majority
   ```

---

## Step 2: Push Code to GitHub

Your code is already at: https://github.com/rakeshkolipaka25/Phish-Tracker.git

---

## Step 3: Deploy to Netlify

### 3.1 Create Netlify Account
1. Go to https://netlify.com
2. Sign up with GitHub
3. Verify your email

### 3.2 Create New Site
1. Click **Add new site** → **Import an existing project**
2. Select **GitHub**
3. Authorize Netlify to access your repositories
4. Select `Phish-Tracker` repository

### 3.3 Configure Build Settings
Netlify will auto-detect settings. Configure:

**Build command**: (leave empty - no build needed)

**Publish directory**: `.` (root directory)

**Functions directory**: `netlify/functions`

### 3.4 Add Environment Variables
Scroll to **Environment variables** and add:

**MONGODB_URI**:
```
mongodb+srv://Rakeshkolipaka:R%40kesh630@cluster0.e1idkwr.mongodb.net/phishaware?retryWrites=true&w=majority&appName=Cluster0
```

### 3.5 Deploy
1. Click **Deploy site**
2. Wait for deployment (1-2 minutes)
3. You'll get a URL like: `https://phish-tracker.netlify.app`

---

## Step 4: Verify Deployment

### 4.1 Test Login Page
1. Open your Netlify URL
2. You should see the Amazon login page directly
3. Fill in the form and submit

### 4.2 Check MongoDB Atlas
1. Go to MongoDB Atlas → Database → Browse Collections
2. Look for `capturedcredentials` collection
3. Verify the submitted credentials are stored

---

## Step 5: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain name
4. Follow DNS instructions

---

## Netlify vs Render

**Netlify Advantages**:
- Faster deployment times
- Better CDN performance
- Serverless functions included
- Free SSL certificates
- Instant rollbacks
- Better for static sites

**Render Advantages**:
- Full Node.js server support
- Longer-running processes
- Better for backend APIs

For your use case (login page only), Netlify is ideal.

---

## Important Notes

### Free Tier Limitations
- **Netlify Free**:
  - 100GB bandwidth/month
  - 300k function invocations/month
  - 125k function execution minutes/month
  - Unlimited sites

- **MongoDB Atlas Free**:
  - 512MB storage
  - Shared cluster

### Security
- Keep MongoDB password secure
- Use environment variables
- Make GitHub repository private
- Monitor MongoDB Atlas for unusual activity

### Troubleshooting

**Issue**: Function deployment fails
- Check Netlify function logs
- Verify MONGODB_URI is correct
- Ensure mongoose dependency is installed

**Issue**: Credentials not saving
- Check MongoDB Atlas connection
- Verify IP whitelist (0.0.0.0/0)
- Check function logs in Netlify dashboard

**Issue**: Login page not loading
- Check netlify.toml configuration
- Verify amazon-phishing.html exists
- Check redirect rules

---

## File Structure

```
PhishingMail/
├── index.html (redirects to amazon-phishing.html)
├── public/
│   ├── amazon-phishing.html (login page)
│   ├── amazon_image.png
│   └── amazon/
│       └── assets/
├── netlify/
│   ├── functions/
│   │   ├── capture-credentials.js (serverless function)
│   │   └── package.json
├── netlify.toml (Netlify configuration)
└── .env.local (local development only)
```

---

## Next Steps

1. Deploy to Netlify
2. Test credential capture
3. Verify MongoDB Atlas storage
4. Share Netlify URL with test users
5. Monitor captured credentials in MongoDB Atlas

---

## Support

- Netlify docs: https://docs.netlify.com
- MongoDB Atlas docs: https://docs.atlas.mongodb.com
- Check Netlify function logs in dashboard
- Check MongoDB Atlas logs
