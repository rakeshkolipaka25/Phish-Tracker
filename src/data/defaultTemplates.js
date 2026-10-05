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
    bodyText: `Dear {{name}},

Your network account password is scheduled to expire today at 18:00 EST under the mandatory 90-day compliance cycle.

To avoid disruption to your workstation, VPN access, and corporate email sync, please verify your profile immediately using the secure portal link below.

If you do not take action, your session will be locked out automatically by administrator policies.

This is an automated system notification from the IT Identity Governance Unit.`,
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
    bodyText: `Hello {{name}},

We blocked an unauthorized attempt to access your enterprise portal:

IP Address: 185.220.101.42 (Moscow, Russian Federation)
Timestamp: Just now
Device: Firefox / Linux x86_64

If this was not you, your credentials may have been compromised. Click below to verify recent sessions.

Failure to respond within 30 minutes will trigger a defensive account suspension.`,
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
    bodyText: `Hi {{name}},

Please find attached your updated remuneration adjustment for the current performance period. Due to new tax withholding revisions, you are requested to confirm your direct deposit details.

Simulated Secure Attachment:
Download Q3_Bonus_DirectDeposit_Details.html
Size: 34 KB | Verified Clean by Gateway

Alternatively, review your statement online.`,
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
  },
   { 
    name: "Amazon Account Security Review", 
    scenario: "security_alert", 
    senderName: "Amazon Security", 
    senderEmail: "security@amazon.com", 
    subject: "Account review required", 
    callToActionText: "Review your account safely", 
    hasAttachment: false, 
    simulatedAttachmentName: "", 
    redFlags: [ 
      "Urgency tactic ('within 24 hours') to pressure quick action", 
      "Sender domain may be spoofed - always verify sender", 
      "Generic greeting without account-specific details", 
      "Direct link requesting account verification without official Amazon workflow" 
    ], 
    bodyText: `amazon 
 
Account review required 
 
Hello {{name}}, 
 
Your account has been temporarily restricted while we complete a routine security review. 
 
We noticed an issue with your account details. Please review the security notification. 
 
If we do not receive a response within 24 hours, some account features may be limited. 
 
We hope to see you again soon. 
 
Amazon 
 
Review your account safely 
Review message`, 
    bodyHtml: ` 
     <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: #eaeded;
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
    }

    .email-container {
      width: 600px;
      max-width: 100%;
      margin: 0 auto;
      background-color: #ffffff;
    }

    .email-content {
      padding: 45px 55px 60px;
    }

    .email-body {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      color: #222;
    }

    .logo {
      display: block;
      width: 150px;
      max-width: 100%;
      height: auto;
    }

    .heading {
      border-bottom: 2px solid #d47800;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }

    .heading h2 {
      color: #d47800;
      margin: 0;
      font-size: 20px;
    }

    .email-body p {
      font-size: 16px;
      line-height: 1.5;
    }

    .email-body ul {
      padding-left: 22px;
      margin: 15px 0;
    }

    .email-body li {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .training-notice {
      background: #fff4d6;
      border: 1px solid #e5c36a;
      padding: 12px;
      margin: 20px 0;
      font-size: 13px;
      line-height: 1.5;
    }

    .footer {
      border-top: 1px solid #e0e0e0;
      margin-top: 30px;
      padding-top: 20px;
      text-align: center;
      color: #666;
      font-size: 11px;
      line-height: 1.6;
    }

    .footer p {
      margin: 5px 0;
    }

    .button {
      display: inline-block;
      background-color: #ff9900;
      color: #ffffff;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      font-size: 15px;
    }

    @media only screen and (max-width: 600px) {

      body {
        background-color: #ffffff !important;
      }

      .outer-padding {
        padding: 10px !important;
      }

      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }

      .email-content {
        padding: 25px 20px 35px !important;
      }

      .email-body {
        width: 100% !important;
        max-width: 100% !important;
      }

      .logo {
        width: 120px !important;
      }

      .heading h2 {
        font-size: 20px !important;
      }

      .email-body p {
        font-size: 15px !important;
        line-height: 1.5 !important;
      }

      .email-body li {
        font-size: 15px !important;
        line-height: 1.5 !important;
        margin-bottom: 8px !important;
      }

      .button {
        padding: 12px 20px !important;
        font-size: 15px !important;
      }

      .footer {
        font-size: 10px !important;
      }
    }
  </style>
</head>

<body>

  <table width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#eaeded;">
    <tr>
      <td align="center" class="outer-padding" style="padding:30px;">

        <table cellpadding="0" cellspacing="0"
               class="email-container">

          <tr>
            <td class="email-content">

              <!-- Logo / Training Header -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:30px; text-align:center;">
                    <img
                      class="logo"
                      src="https://res.cloudinary.com/ggiaxoqc/image/upload/f_auto/q_auto/amazon_image.png"
                      alt="Training Simulation"
                      width="150"
                      height="50"
                    >
                  </td>
                </tr>
              </table>

              <!-- Email Content -->
              <div class="email-body">

                <div class="heading">
                  <h2>Customer Support</h2>
                </div>

                <p>Dear {{name}},</p>

                <p>
                  The Great Indian Festival is scheduled to begin on
                  <strong>8 October</strong>. Here is a simulated preview
                  of the type of promotional message you may encounter.
                </p>

                <ul>
                  <li>
                    <strong>Electronics &amp; Gadgets:</strong> Up to 40% off on
                    smartphones, laptops, and smart TVs.
                  </li>

                  <li>
                    <strong>Home &amp; Kitchen:</strong> Up to 50% off on appliances,
                    decor, and festive essentials.
                  </li>

                  <li>
                    <strong>Fashion &amp; Beauty:</strong> Special offers on selected
                    clothing and beauty products.
                  </li>

                  <li>
                    <strong>Everyday Essentials:</strong> Special savings on selected
                    grocery and household products.
                  </li>
                </ul>

                <p>
                  Don't wait until the best items sell out. Click below to explore the festive offers.
                </p>

                <div style="text-align:center; margin:30px 0;">
                  <a href="{{trackingLink}}" class="button">
                    Shop Now
                  </a>
                </div>

                <p style="font-size:21px; color:#888;">
                  Happy Shopping!
                </p>

                <p style="font-size:11px; color:#888;">
                  Warm Regards,
                </p>

                <strong>The Amazon Team</strong>

                <!-- Footer -->
                <div class="footer">

                  <p>
                    Conditions of Use &nbsp; | &nbsp;
                    Privacy Notice &nbsp; | &nbsp;
                    Help
                  </p>

                  <p>
                    © 1996–2026, Amazon.com, Inc. or its affiliates
                  </p>


                </div>

              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    ` 
  },
  {
    name: "Dussehra Gift - Amazon Gift Card",
    scenario: "festive_gift",
    senderName: "Rakesh Kolipaka",
    senderEmail: "kolipakarakesh1234@gmail.com",
    subject: "Happy Dussehra",
    callToActionText: "Amazon Sign In",
    hasAttachment: false,
    simulatedAttachmentName: "",
    redFlags: [
      "Unexpected gift offer creates emotional incentive",
      "Urgency to claim limited-time offer",
      "Request to verify employee details for gift redemption",
      "External link to login page for gift claim"
    ],
    bodyText: `Dear Team,

As we celebrate Dussehra, the victory of good over evil, I want to take a moment to thank each one of you. Your dedication and hard work have been the driving force behind Microcare's growth this year, and none of it would have been possible without you.

As a token of our appreciation, we are delighted to offer every Microcare employee an Amazon Gift Card worth ₹5,000.

Please verify your employee details and redeem your voucher using the link below:

[Claim Your Gift Card – Amazon Sign In]

Wishing you and your family a joyful and prosperous Dussehra.

Warm regards
MD, Microcare`,
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Dear Team,</p>
        
        <p>As we celebrate Dussehra, the victory of good over evil, I want to take a moment to thank each one of you. Your dedication and hard work have been the driving force behind Microcare's growth this year, and none of it would have been possible without you.</p>
        
        <p>As a token of our appreciation, we are delighted to offer every Microcare employee an Amazon Gift Card worth ₹5,000.</p>
        
        <p>Please verify your employee details and redeem your voucher using the link below:</p>
        
        <p><a href="{{trackingLink}}" style="display: inline-block; background-color: #ff9900; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Amazon Sign In</a></p>
        
        <p>Wishing you and your family a joyful and prosperous Dussehra.</p>
        
        <p>Warm regards,<br><strong>MD, Microcare</strong></p>
        <img src="{{trackingPixel}}" width="1" height="1" style="display:none;" alt="" />
      </div>
    `
  }
];

module.exports = defaultTemplates;
