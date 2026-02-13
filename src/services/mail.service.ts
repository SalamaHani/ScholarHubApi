import nodemailer from 'nodemailer';
import config from '../config/index.js';

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
});

/**
 * Send email notification when application status changes
 */
export const sendApplicationStatusEmail = async (
    email: string,
    name: string,
    scholarshipTitle: string,
    status: string,
    notes?: string
) => {
    let statusColor = '#3b82f6'; // Default blue
    let statusText = status.replace('_', ' ');
    let message = '';

    if (status === 'ACCEPTED') {
        statusColor = '#10b981'; // Green
        message = `Congratulations! Your application for <strong>${scholarshipTitle}</strong> has been accepted.`;
    } else if (status === 'REJECTED') {
        statusColor = '#ef4444'; // Red
        message = `Thank you for your interest. We regret to inform you that your application for <strong>${scholarshipTitle}</strong> was not selected at this time.`;
    } else if (status === 'UNDER_REVIEW') {
        statusColor = '#f59e0b'; // Amber
        message = `Your application for <strong>${scholarshipTitle}</strong> is now under review by our committee.`;
    } else {
        message = `There has been an update to your application for <strong>${scholarshipTitle}</strong>. Your application is now in <strong>${statusText}</strong> status.`;
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #4f46e5; text-decoration: none; }
        .content { background: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; text-transform: uppercase; color: white; background-color: ${statusColor}; margin-bottom: 20px; }
        h1 { font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; }
        p { margin-bottom: 16px; font-size: 16px; }
        .notes { background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #d1d5db; margin-top: 24px; }
        .footer { text-align: center; margin-top: 32px; font-size: 14px; color: #6b7280; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="${config.frontendUrl}" class="logo">ScholarHub</a>
        </div>
        <div class="content">
          <div class="status-badge">${statusText}</div>
          <h1>Hello, ${name}</h1>
          <p>${message}</p>
          
          ${notes ? `
          <div class="notes">
            <p style="margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #4b5563;">COMMITTEE FEEDBACK:</p>
            <p style="margin-bottom: 0;">${notes}</p>
          </div>
          ` : ''}
          
          <a href="${config.frontendUrl}/applications" class="button">View Application Status</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ScholarHub. All rights reserved.</p>
          <p>You received this email because you applied for a scholarship on ScholarHub.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    try {
        await transporter.sendMail({
            from: `"${config.smtp.from}" <${config.smtp.user}>`,
            to: email,
            subject: `Application Status Update: ${scholarshipTitle}`,
            html: htmlContent,
        });
        console.log(`Status email sent to ${email} for scholarship ${scholarshipTitle}`);
    } catch (error) {
        console.error('Error sending status email:', error);
        // Don't throw error to avoid breaking the application status update flow
    }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
    email: string,
    name: string,
    resetToken: string
) => {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #4f46e5; text-decoration: none; }
        .content { background: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        h1 { font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; color: #111827; }
        p { margin-bottom: 16px; font-size: 16px; color: #374151; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
        .button:hover { background: #4338ca; }
        .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0; }
        .warning-box p { margin: 0; font-size: 14px; color: #92400e; }
        .footer { text-align: center; margin-top: 32px; font-size: 14px; color: #6b7280; }
        .token-box { background: #f3f4f6; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; word-break: break-all; margin: 16px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="${config.frontendUrl}" class="logo">🎓 ScholarHub</a>
        </div>
        <div class="content">
          <h1>Password Reset Request</h1>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password for your ScholarHub account. Click the button below to create a new password:</p>

          <a href="${resetUrl}" class="button">Reset Password</a>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <div class="token-box">${resetUrl}</div>

          <div class="warning-box">
            <p><strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.</p>
          </div>

          <p>Best regards,<br>The ScholarHub Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ScholarHub. All rights reserved.</p>
          <p>If you have any questions, contact us at support@scholarhub.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

    try {
        await transporter.sendMail({
            from: `"ScholarHub" <${config.smtp.user}>`,
            to: email,
            subject: 'Password Reset Request - ScholarHub',
            html: htmlContent,
        });
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};
