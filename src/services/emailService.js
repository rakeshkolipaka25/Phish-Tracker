const nodemailer = require('nodemailer');
const fs = require('fs');

class EmailService {
  constructor() {
    this.etherealTransporter = null;
  }

  // Compile template HTML with custom tracking markers
  compileEmail({ template, recipient, baseUrl }) {
    const trackingPixel = `${baseUrl}/track/open?token=${recipient.trackingToken}`;
    const trackingLink = `${baseUrl}/track/click?token=${recipient.trackingToken}`;
    const attachmentLink = `${baseUrl}/track/attachment?token=${recipient.trackingToken}`;

    let body = template.bodyHtml || '';
    
    // Replace placeholders
    body = body
      .replace(/{{name}}/g, recipient.fullName || 'User')
      .replace(/{{email}}/g, recipient.email)
      .replace(/{{trackingPixel}}/g, trackingPixel)
      .replace(/{{trackingLink}}/g, trackingLink)
      .replace(/{{attachmentLink}}/g, attachmentLink);

    return {
      body,
      trackingPixel,
      trackingLink,
      attachmentLink
    };
  }

  async getTransporter() {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      return {
        transporter: nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465', 10),
          secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        }),
        isEthereal: false,
        fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER
      };
    }

    if (!this.etherealTransporter) {
      const testAccount = await nodemailer.createTestAccount();
      this.etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.etherealUser = testAccount.user;
    }

    return {
      transporter: this.etherealTransporter,
      isEthereal: true,
      fromEmail: this.etherealUser
    };
  }

  async sendSimulatedEmail({ template, recipient, baseUrl }) {
    const { body, attachmentLink, trackingPixel } = this.compileEmail({ template, recipient, baseUrl });

    const attachments = [];

    // 1. If user uploaded a custom file from dashboard form
    if (template.uploadedFile) {
      try {
        attachments.push({
          filename: template.uploadedFile.originalname || template.uploadedFile.filename,
          path: template.uploadedFile.path
        });
      } catch (e) {
        console.error('Attachment upload read error:', e.message);
      }
    } 
    // 2. Or if simulated default HTML attachment requested
    else if (template.hasAttachment) {
      const fileName = template.simulatedAttachmentName || 'Payroll_Salary_Statement.html';
      const fileContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Confidential Corporate File</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background:#0b1329; color:#f1f5f9; display:flex; justify-content:center; align-items:center; min-height:100vh; padding:20px; }
    .card { background:#1e293b; border:1px solid #334155; border-radius:14px; padding:36px; max-width:480px; width:100%; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.5); }
    .badge { background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3); padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; display:inline-block; margin-bottom:16px; }
    h2 { font-size:20px; margin-bottom:12px; color:#ffffff; }
    p { color:#94a3b8; font-size:14px; line-height:1.6; margin-bottom:24px; }
    .btn { display:inline-block; width:100%; background:linear-gradient(135deg, #ef4444, #dc2626); color:#fff; text-decoration:none; padding:14px; border-radius:8px; font-weight:700; font-size:15px; box-shadow:0 4px 14px rgba(239,68,68,0.4); }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🔒 PROTECTED DOCUMENT</div>
    <h2>Confidential Compensation / Tax Document</h2>
    <p>This file is protected by identity access policies. To view the salary appraisal statement, confirm your credentials.</p>
    <a href="${attachmentLink}" class="btn">View & Unlock Document</a>
  </div>
</body>
</html>`;

      attachments.push({
        filename: fileName,
        content: fileContent,
        contentType: 'text/html'
      });
    }

    try {
      const { transporter, isEthereal, fromEmail } = await this.getTransporter();

      // Wrap in clean styling container with invisible web beacon
      const fullHtml = `
        ${body}
        <img src="${trackingPixel}" width="1" height="1" style="display:none;width:1px;height:1px;" alt="" />
      `;

      const mailOptions = {
        from: `"${template.senderName || 'Security Operations'}" <${fromEmail}>`,
        replyTo: fromEmail,
        to: recipient.email,
        subject: template.subject,
        html: fullHtml,
        attachments: attachments
      };

      const info = await transporter.sendMail(mailOptions);

      let previewUrl = null;
      if (isEthereal) {
        previewUrl = nodemailer.getTestMessageUrl(info);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl,
        mode: isEthereal ? 'ethereal' : 'smtp'
      };
    } catch (err) {
      console.error(`Email delivery failed for ${recipient.email}:`, err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new EmailService();
