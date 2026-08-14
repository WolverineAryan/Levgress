const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const config = require('./src/config/env');
const connectDB = require('./src/config/db');

const sendEmails = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    // Fetch all student users
    const users = await User.find({ role: 'STUDENT' });
    console.log(`Found ${users.length} student users to email.`);

    if (users.length === 0) {
      console.log('No users found. Exiting.');
      process.exit(0);
    }

    // Configure SMTP transport using config.js env mappings
    const smtpHost = config.emailHost;
    const smtpPort = parseInt(config.emailPort, 10);
    const smtpUser = config.emailUser;
    const smtpPass = config.emailPass;

    console.log(`Configuring SMTP transporter for host: ${smtpHost}:${smtpPort}...`);

    if (!smtpUser || !smtpPass) {
      console.error('ERROR: EMAIL_USER or EMAIL_PASS not set in environment configurations.');
      process.exit(1);
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for 587 or 25
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify SMTP connection settings
    await transporter.verify();
    console.log('SMTP transporter connection verified successfully.');

    // Loop and send emails
    for (const user of users) {
      if (!user.email) {
        console.warn(`Skipping user "${user.name}" as they do not have a configured email address.`);
        continue;
      }
      
      const mailOptions = {
        from: `"Levgress Team" <${smtpUser}>`,
        to: user.email,
        subject: '[Levgress] Help Us Test the New Gamified Learning & Milestone Portfolio System!',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 30px auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
            .header { background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -25px -25px 25px -25px; }
            .header h2 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
            .content { padding: 5px 10px; }
            .content p { font-size: 15px; color: #334155; margin-bottom: 16px; }
            .steps-container { background-color: #f1f5f9; padding: 20px; border-left: 4px solid #3b82f6; margin: 24px 0; border-radius: 0 8px 8px 0; }
            .steps-title { font-weight: bold; font-size: 15px; color: #0f172a; margin-bottom: 12px; display: block; }
            .step-item { margin-bottom: 12px; font-size: 14px; color: #475569; }
            .step-item strong { color: #0f172a; }
            .footer { margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #64748b; }
            .footer p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Levgress — QA Testing Invitation</h2>
            </div>
            <div class="content">
              <p>Dear ${user.name || 'Student'},</p>
              <p>We are pleased to announce that a major Quality Assurance update has been deployed to the <strong>Levgress</strong> Gamified Learning & Milestone Portfolio System. This update addresses all core security validation checks, project visibilities, active streak metrics, and introduces background-decoupled AI milestone evaluation.</p>
              <p>To help us verify the integrity and performance of the application in the deployed environment, we kindly request you to complete the following testing steps:</p>
              
              <div class="steps-container">
                <span class="steps-title">📋 Recommended Steps for Testing:</span>
                <div class="step-item"><strong>1. Onboard / Log In:</strong> Access the application, sign in, or register. Your account role will be verified securely as STUDENT.</div>
                <div class="step-item"><strong>2. Create a Project:</strong> Navigate to your dashboard, click "New Project", define your technology stack, and toggle your preferred project visibility (Public or Private).</div>
                <div class="step-item"><strong>3. Submit Milestone Evidence:</strong> Submit a plan/PDF or descriptive text for Milestone 1. The submission will persist instantly, and AI grading will process in the background.</div>
                <div class="step-item"><strong>4. Verify Skill Levels:</strong> Complete quizzes in your stack technologies under the Skills tab to accumulate skill XP and update your validation badge tiers.</div>
                <div class="step-item"><strong>5. Engage in the Showcase Feed:</strong> Visit the Showcase page to post technical updates, attach your project, leave comments, and test pagination by loading older posts.</div>
              </div>
              
              <p>Your feedback is invaluable to ensuring a secure and optimal learning platform. If you encounter any bugs, please note them so they can be addressed.</p>
              <p>Thank you for your time, assistance, and support.</p>
              
              <div class="footer">
                <p>Sincerely,</p>
                <p><strong>Lead Software Developers:</strong></p>
                <p>• Pranav Thormise</p>
                <p>• Vaishnavi Bhandare</p>
                <p style="margin-top: 10px; font-size: 11px; color: #94a3b8;">Levgress Systems | QA Testing Campaign 2026</p>
              </div>
            </div>
          </div>
        </body>
        </html>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to: ${user.email}`);
      } catch (err) {
        console.error(`Failed to send email to ${user.email}:`, err);
      }
    }

    console.log('All student notification emails processed.');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error executing email distribution script:', error);
    process.exit(1);
  }
};

sendEmails();
