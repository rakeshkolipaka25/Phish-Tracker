require('dotenv').config();
const emailService = require('./src/services/emailService');
const { v4: uuidv4 } = require('uuid');

async function sendTestEmail() {
  const template = {
    name: "Amazon Security Alert",
    senderName: "Amazon Security",
    senderEmail: "security@amazon.com",
    subject: "Action Required: Unauthorized Device Sign-In Attempt Detected",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #fff9c4; border-left: 4px solid #fbc02d; padding: 14px; margin-bottom: 20px;">
          <strong style="color: #f57f17; font-size: 16px;">Security Warning: New Device Login</strong>
        </div>
        <p>Hello User,</p>
        <p>We detected a sign-in attempt to your Amazon account from a new device.</p>
        <p>If this was you, no action is needed. If not, please secure your account immediately:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="{{trackingLink}}" style="background-color: #ff9900; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block;">Secure Your Account</a>
        </div>
        <p style="font-size: 12px; color: #666;">This is an automated message from Amazon Security.</p>
        <img src="{{trackingPixel}}" width="1" height="1" style="display:none;" alt="" />
      </div>
    `,
    hasAttachment: false
  };

  const recipient = {
    email: 'bdark4381@gmail.com',
    fullName: 'User',
    trackingToken: uuidv4()
  };

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  console.log('Using BASE_URL:', baseUrl);

  const result = await emailService.sendSimulatedEmail({
    template,
    recipient,
    baseUrl
  });

  if (result.success) {
    console.log('✅ Email sent successfully to bdark4381@gmail.com');
    console.log('Message ID:', result.messageId);
    if (result.previewUrl) {
      console.log('Preview URL:', result.previewUrl);
    }
  } else {
    console.log('❌ Failed to send email:', result.error);
  }
}

sendTestEmail();
