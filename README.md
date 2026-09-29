# 🛡️ PhishAware - Authorized Security Awareness & Phishing Simulation Platform

PhishAware is an enterprise-grade cybersecurity awareness and simulated phishing testing system built with **Node.js, Express, and MongoDB**.

It is strictly engineered for **authorized training and employee awareness**. It tests vigilance, records telemetry, and immediately redirects users to an interactive **teachable moment / education portal** without capturing, storing, or soliciting passwords or sensitive credentials.

---

## 🚀 Key Features

1. **Simulated Phishing Templates & Scenarios**
   - Realistic pre-configured templates (Urgent M365 Password Expiry, Unauthorized Sign-In Alert, Q3 Payroll/Tax Adjustment).
   - Pre-populated red flags (e.g. artificial urgency, spoofed domains, unverified links).
   - Configurable email subject, sender name, HTML body, and simulated attachment.

2. **Delivery & Telemetry Tracking**
   - **Delivery Status:** Real-time logging of message transmission status.
   - **Open Tracking:** 1x1 transparent web beacon pixel (`/track/open?token=...`).
   - **Link Click Tracking:** Intercepted by `/track/click?token=...` which logs interaction and immediately displays the Teachable Moment training page.
   - **Simulated Attachment Tracking:** Safe simulated attachment download via `/track/attachment?token=...`.
   - **Awareness Completion:** Allows users to acknowledge and complete the educational module.

3. **Executive Dashboard & Compliance Reporting**
   - Key Performance Indicators: Delivered, Open Rate, Click Rate, Awareness Trained count.
   - Interactive visual funnel chart and vulnerability distribution.
   - Recipient interaction log table with direct simulation test triggers.
   - Audit report generation per campaign with department-level risk breakdowns and export/print capability.

4. **Safety Controls & Ethics**
   - Strictly controlled authorized recipient lists.
   - Headers identifying authorized security simulation (`X-Phishing-Simulation: Controlled-Awareness-Exercise`).
   - Educational safety banners ensuring test targets are not alarmed.

---

## ⚙️ Configuration (.env)

Edit the `.env` file in the project root:

```env
PORT=3000
BASE_URL=http://localhost:3000

# MongoDB Configuration:
# For MongoDB Atlas (Recommended):
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/phishaware?retryWrites=true&w=majority

# Or local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/phishaware

# Optional: Live SMTP credentials (If blank, simulation mode generates instant test deliveries)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

---

## 💻 Running the Application

To start the server:

```powershell
npm start
```

Or using Node directly:
```powershell
node server.js
```

Then visit:
* **Admin Dashboard:** `http://localhost:3000`
* **Health API Check:** `http://localhost:3000/api/health`

---

## 🧪 Testing the Simulation

1. Click **"Load Templates"** or **"+ New Campaign"**.
2. Provide a title, choose a template (e.g., *Urgent Password Expiry*), and paste recipient lines:
   ```text
   Alex Mercer, alex.mercer@company.internal, Finance
   Jordan Lee, jordan.lee@company.internal, Engineering
   ```
3. Click **"Launch Simulation"**.
4. Test the user interaction by clicking **"Simulate Click"** in the Recipient Security Interaction Log table:
   - You will see the responsive **Authorized Security Awareness Education Page** highlighting the exact red flags present in the email.
   - Click **"I Acknowledge & Complete Awareness Training"** to complete the training.
5. Refresh the dashboard to see real-time updates to Open Rate, Click-Through Rate, and Charts!
