const defaultTemplates = [
  {
    name: "Urgent Microsoft 365 Password Expiry",
    scenario: "password_reset",
    senderName: "IT Support Helpdesk",
    senderEmail: "admin-alert@sec-support-notification.net",
    subject: "ACTION REQUIRED: Your corporate password expires in 2 hours",
    callToActionText: "Keep Current Password / Extend Access",
    hasAttachment: false,
    simulatedAttachmentName: "",
    redFlags: [
      "Artificial urgency ('expires in 2 hours') designed to cause panic",
      "Sender domain (sec-support-notification.net) does not match internal domain",
      "Generic salutation without official employee reference number",
      "Direct link requesting credential re-entry without multi-factor workflow"
    ],
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
        <div style="border-bottom: 2px solid #0078d4; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #0078d4; margin: 0; font-size: 20px;">IT Infrastructure & Security Notice</h2>
        </div>
        <p>Dear {{name}},</p>
        <p>Your network account password is scheduled to expire today at <strong>18:00 EST</strong> under the mandatory 90-day compliance cycle.</p>
        <p>To avoid disruption to your workstation, VPN access, and corporate email sync, please verify your profile immediately using the secure portal link below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{trackingLink}}" style="background-color: #0078d4; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Keep Current Password / Extend Access</a>
        </div>
        <p style="font-size: 13px; color: #666;">If you do not take action, your session will be locked out automatically by administrator policies.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin-top: 30px;" />
        <p style="font-size: 11px; color: #888;">This is an automated system notification from the IT Identity Governance Unit.</p>
        <img src="{{trackingPixel}}" width="1" height="1" style="display:none;" alt="" />
      </div>
    `
  },
  {
    name: "Suspicious Account Sign-in Alert",
    scenario: "security_alert",
    senderName: "Corporate Security Operations",
    senderEmail: "security@account-auth-check.org",
    subject: "Security Alert: Unusual sign-in attempt detected from Moscow, RU",
    callToActionText: "Review Sign-In & Secure Account",
    hasAttachment: false,
    simulatedAttachmentName: "",
    redFlags: [
      "Alarming geographical location (Moscow, RU) to prompt hasty clicks",
      "Sender domain (account-auth-check.org) is external and spoofed",
      "Direct verification link that redirects outside verified corporate SSO"
    ],
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; margin-bottom: 20px;">
          <strong style="color: #991b1b; font-size: 16px;">Security Warning: New Device Login</strong>
        </div>
        <p>Hello {{name}},</p>
        <p>We blocked an unauthorized attempt to access your enterprise portal:</p>
        <ul style="background: #f8fafc; padding: 15px 30px; border-radius: 6px; font-size: 14px; list-style-type: square;">
          <li><strong>IP Address:</strong> 185.220.101.42 (Moscow, Russian Federation)</li>
          <li><strong>Timestamp:</strong> Just now</li>
          <li><strong>Device:</strong> Firefox / Linux x86_64</li>
        </ul>
        <p>If this was not you, your credentials may have been compromised. Click below to verify recent sessions:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="{{trackingLink}}" style="background-color: #dc2626; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Review Sign-In & Secure Account</a>
        </div>
        <p style="font-size: 12px; color: #64748b;">Failure to respond within 30 minutes will trigger a defensive account suspension.</p>
        <img src="{{trackingPixel}}" width="1" height="1" style="display:none;" alt="" />
      </div>
    `
  },
  {
    name: "Payroll Department: Q3 Bonus & Tax Adjustment",
    scenario: "invoice_attachment",
    senderName: "Payroll & Compensation",
    senderEmail: "finance-team@internal-hr-payroll.com",
    subject: "Updated Q3 Remuneration Schedule & Direct Deposit Statement",
    callToActionText: "View Remuneration Portal",
    hasAttachment: true,
    simulatedAttachmentName: "Q3_Bonus_DirectDeposit_Details.html",
    redFlags: [
      "Emotion/Greed incentive (unexpected financial compensation/bonus)",
      "Unsolicited attachment disguised as financial statement",
      "External domain imitating internal finance operations"
    ],
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h3 style="color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 8px;">Finance & Payroll Operations</h3>
        <p>Hi {{name}},</p>
        <p>Please find attached your updated remuneration adjustment for the current performance period. Due to new tax withholding revisions, you are requested to confirm your direct deposit details.</p>
        <div style="background-color: #f0fdf4; border: 1px dashed #22c55e; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <strong>Simulated Secure Attachment:</strong><br />
          <a href="{{attachmentLink}}" style="color: #15803d; font-weight: bold; text-decoration: underline; display: inline-block; margin-top: 8px;">
             Download Q3_Bonus_DirectDeposit_Details.html
          </a>
          <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">Size: 34 KB | Verified Clean by Gateway</div>
        </div>
        <p>Alternatively, review your statement online:</p>
        <p><a href="{{trackingLink}}" style="color: #0f766e; font-weight: bold;">Access Payroll Portal &rarr;</a></p>
        <img src="{{trackingPixel}}" width="1" height="1" style="display:none;" alt="" />
      </div>
    `
  }
];

module.exports = defaultTemplates;
