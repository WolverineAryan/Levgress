const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const config = require('./src/config/env');
const User = require('./src/models/User');

const email = process.argv[2];
const nameInput = process.argv[3]; // Optional manual name

if (!email) {
  console.error('Please specify an email address. Example: node promote.js user@example.com "Instructor Name"');
  process.exit(1);
}

const promote = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to Database.');

    let user = await User.findOne({ email: email.toLowerCase() });
    const name = nameInput || (user ? user.name : email.split('@')[0]);

    if (!user) {
      // Pre-create the user as STAFF if they haven't logged in yet
      user = await User.create({
        name,
        email: email.toLowerCase(),
        role: 'STAFF',
        onboarded: true,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      });
      console.log(`Created new instructor account for: ${email}`);
    } else {
      user.role = 'STAFF';
      if (nameInput) user.name = nameInput;
      await user.save();
      console.log(`Successfully promoted existing user ${email} to STAFF (Instructor).`);
    }

    // Email configuration from env variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');

    if (!emailUser || !emailPass) {
      console.log('\n⚠️ User promoted successfully, but welcome email was skipped because EMAIL_USER and EMAIL_PASS environment variables are not set.');
      console.log('Please see instructions on how to set up email credentials.');
      process.exit(0);
    }

    console.log(`Sending welcome email to ${email}...`);

    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const loginUrl = 'https://levgress.vercel.app/login';

    const mailOptions = {
      from: `"Levgress Team" <${emailUser}>`,
      to: email.toLowerCase(),
      subject: 'Levgress Portal: Instructor Access Activated',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #faf8f5;
              color: #2b2622;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border: 1px solid #e8e2dc;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(43, 38, 34, 0.03);
            }
            .header {
              background-color: #2b2622;
              padding: 32px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
              font-weight: 900;
              letter-spacing: 3px;
              font-family: 'Courier New', Courier, monospace;
            }
            .header .subtitle {
              color: #c08552;
              margin: 8px 0 0 0;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 2px;
            }
            .content {
              padding: 40px 32px;
              line-height: 1.6;
              font-size: 14px;
            }
            .content h2 {
              color: #2b2622;
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 20px;
            }
            .content p {
              margin-bottom: 16px;
              color: #5c534c;
            }
            .credentials-box {
              background-color: #faf8f5;
              border: 1px dashed #c08552;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
            }
            .credentials-title {
              font-size: 11px;
              font-weight: 800;
              color: #c08552;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 12px;
            }
            .credential-row {
              margin-bottom: 8px;
              font-size: 13px;
            }
            .credential-row strong {
              color: #2b2622;
              display: inline-block;
              width: 120px;
            }
            .bullet-list {
              background-color: #faf8f5;
              border: 1px solid #e8e2dc;
              border-radius: 12px;
              padding: 20px 24px;
              margin: 24px 0;
              list-style-type: none;
            }
            .bullet-list li {
              margin-bottom: 12px;
              position: relative;
              padding-left: 20px;
              color: #2b2622;
              font-size: 13px;
            }
            .bullet-list li::before {
              content: "✦";
              position: absolute;
              left: 0;
              color: #c08552;
            }
            .btn-container {
              text-align: center;
              margin: 32px 0;
            }
            .btn {
              background-color: #c08552;
              color: #ffffff !important;
              text-decoration: none;
              padding: 12px 28px;
              font-size: 13px;
              font-weight: bold;
              border-radius: 8px;
              display: inline-block;
              box-shadow: 0 4px 6px rgba(192, 133, 82, 0.15);
            }
            .footer {
              background-color: #faf8f5;
              padding: 24px;
              text-align: center;
              font-size: 11px;
              color: #a6998c;
              border-top: 1px solid #e8e2dc;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LEVGRESS</h1>
              <div class="subtitle">INSTRUCTOR PORTAL</div>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Your administrative access profile has been officially provisioned as an <strong>Instructor (STAFF)</strong> on the Levgress learning platform.</p>
              
              <div class="credentials-box">
                <div class="credentials-title">Your Portal Credentials</div>
                <div class="credential-row">
                  <strong>Registered Email:</strong> <span style="font-family: monospace; font-weight: bold;">${email.toLowerCase()}</span>
                </div>
                <div class="credential-row">
                  <strong>Access Method:</strong> <span style="color: #c08552; font-weight: bold;">Google Single Sign-On (SSO)</span>
                </div>
                <p style="margin: 12px 0 0 0; font-size: 11px; color: #a6998c; line-height: 1.4;">
                  Note: Since Levgress uses passwordless Google authentication, you do not need a password. Simply click the link below and choose "Sign in with Google" using your registered email address.
                </p>
              </div>

              <p>With this access, you will be able to manage and evaluate student progress directly. Here is an overview of your dashboard capabilities:</p>
              
              <ul class="bullet-list" style="padding-left: 0; margin-left: 0;">
                <li><strong>Evaluate Milestones</strong>: Review live student project deliverables, review code implementations, and approve or reject submissions in real-time.</li>
                <li><strong>Award XP</strong>: Manually override feedback scales and credit experience points (XP) directly to students.</li>
                <li><strong>Mentorship Discussions</strong>: Interact with students through contextual comment threads linked directly to their project pipelines.</li>
              </ul>

              <div class="btn-container">
                <a href="${loginUrl}" class="btn" target="_blank">Access Instructor Dashboard</a>
              </div>

              <p>If you have any questions or require administrative support, please do not hesitate to contact our team.</p>
              
              <p>Warm regards,<br><strong>The Levgress Engineering Team</strong></p>
            </div>
            <div class="footer">
              This email is intended for ${email}.<br>
              © ${new Date().getFullYear()} Levgress. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email successfully sent!');
    process.exit(0);
  } catch (err) {
    console.error('Error during promotion or email sending:', err);
    process.exit(1);
  }
};

promote();
