import { Resend } from 'resend';
import config from '../config/index.js';

// Lazy client — only created when a key is present to avoid crash on startup
let _resend: Resend | null = null;
const getResend = (): Resend | null => {
    if (!config.resend.apiKey) return null;
    if (!_resend) _resend = new Resend(config.resend.apiKey);
    return _resend;
};

const FROM = config.resend.from;
const BASE_URL = config.frontendUrl;
const YEAR = new Date().getFullYear();

// ─── Shared layout ────────────────────────────────────────────────────────────

const emailWrapper = (body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6; color: #1f2937; padding: 40px 16px;
    }
    .wrapper { max-width: 600px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { font-size: 26px; font-weight: 800; color: #4f46e5; text-decoration: none; letter-spacing: -0.5px; }
    .logo span { color: #10b981; }
    .card {
      background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb;
      box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 40px 36px;
    }
    .badge {
      display: inline-block; padding: 5px 14px; border-radius: 9999px;
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: #fff; margin-bottom: 24px;
    }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 16px; color: #111827; }
    p  { font-size: 15px; line-height: 1.7; color: #374151; margin-bottom: 14px; }
    .btn {
      display: inline-block; background: #4f46e5; color: #fff !important;
      padding: 13px 28px; border-radius: 10px; text-decoration: none;
      font-weight: 600; font-size: 15px; margin-top: 20px;
    }
    .info-box {
      background: #f9fafb; border-left: 4px solid #d1d5db;
      border-radius: 8px; padding: 16px 20px; margin: 24px 0;
    }
    .info-box p { margin: 0; font-size: 14px; color: #4b5563; }
    .warn-box {
      background: #fef3c7; border-left: 4px solid #f59e0b;
      border-radius: 8px; padding: 16px 20px; margin: 24px 0;
    }
    .warn-box p { margin: 0; font-size: 14px; color: #92400e; }
    .token-box {
      background: #f3f4f6; border-radius: 8px; padding: 12px 16px;
      font-family: 'Courier New', monospace; font-size: 13px;
      word-break: break-all; color: #374151; margin: 16px 0;
    }
    .progress-bar { background: #e5e7eb; border-radius: 9999px; height: 10px; overflow: hidden; margin: 20px 0; }
    .footer { text-align: center; margin-top: 28px; font-size: 13px; color: #9ca3af; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <a href="${BASE_URL}" class="logo">Scholar<span>Hub</span></a>
    </div>
    <div class="card">${body}</div>
    <div class="footer">
      <p>© ${YEAR} ScholarHub. All rights reserved.</p>
      <p>Questions? <a href="mailto:support@scholarhub.com" style="color:#4f46e5;">support@scholarhub.com</a></p>
    </div>
  </div>
</body>
</html>`;

const send = async (to: string, subject: string, html: string, ctx: string) => {
    const client = getResend();
    if (!client) {
        console.warn(`[Resend] RESEND_API_KEY not set — skipping email (${ctx}) → ${to}`);
        return;
    }
    const { error } = await client.emails.send({ from: FROM, to, subject, html });
    if (error) {
        console.error(`[Resend] Failed (${ctx}) → ${to}:`, error);
    } else {
        console.log(`[Resend] Sent (${ctx}) → ${to}`);
    }
};

// ─── 1. Application Status Update ────────────────────────────────────────────

export const sendApplicationStatusEmail = async (
    email: string,
    name: string,
    scholarshipTitle: string,
    status: string,
    notes?: string
) => {
    const map: Record<string, { color: string; label: string; msg: string }> = {
        ACCEPTED:     { color: '#10b981', label: 'Accepted',     msg: `Congratulations! Your application for <strong>${scholarshipTitle}</strong> has been accepted.` },
        REJECTED:     { color: '#ef4444', label: 'Not Selected', msg: `Thank you for your interest. Your application for <strong>${scholarshipTitle}</strong> was not selected at this time.` },
        UNDER_REVIEW: { color: '#f59e0b', label: 'Under Review', msg: `Your application for <strong>${scholarshipTitle}</strong> is now under review by our committee.` },
    };
    const s = map[status] ?? { color: '#3b82f6', label: status.replace(/_/g, ' '), msg: `There has been an update to your application for <strong>${scholarshipTitle}</strong>.` };

    const html = emailWrapper(`
        <div class="badge" style="background:${s.color};">${s.label}</div>
        <h1>Hello, ${name}</h1>
        <p>${s.msg}</p>
        ${notes ? `<div class="info-box"><p style="font-weight:600;margin-bottom:8px;font-size:13px;text-transform:uppercase;">Committee Feedback</p><p style="margin-top:4px;">${notes}</p></div>` : ''}
        <a href="${BASE_URL}/applications" class="btn">View Application</a>
    `);

    try { await send(email, `Application Update: ${scholarshipTitle}`, html, 'application-status'); }
    catch (err) { console.error('[Resend] sendApplicationStatusEmail:', err); }
};

// ─── 2. Password Reset ────────────────────────────────────────────────────────

export const sendPasswordResetEmail = async (
    email: string,
    name: string,
    resetToken: string
) => {
    const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;

    const html = emailWrapper(`
        <h1>Password Reset Request</h1>
        <p>Hello ${name},</p>
        <p>We received a request to reset your ScholarHub password. Click below to create a new one:</p>
        <a href="${resetUrl}" class="btn">Reset My Password</a>
        <p style="margin-top:24px;font-size:14px;color:#6b7280;">If the button doesn't work, copy this link into your browser:</p>
        <div class="token-box">${resetUrl}</div>
        <div class="warn-box">
          <p><strong>⚠️ Security Notice:</strong> This link expires in <strong>1 hour</strong>. If you didn't request a reset, you can safely ignore this email.</p>
        </div>
        <p>Best regards,<br>The ScholarHub Team</p>
    `);

    try { await send(email, 'Reset Your ScholarHub Password', html, 'password-reset'); }
    catch (err) { console.error('[Resend] sendPasswordResetEmail:', err); throw new Error('Failed to send password reset email'); }
};

// ─── 3. Scholarship Approved ──────────────────────────────────────────────────

export const sendScholarshipApprovedEmail = async (
    email: string,
    name: string,
    scholarshipTitle: string,
    scholarshipId: string
) => {
    const html = emailWrapper(`
        <div class="badge" style="background:#10b981;">Approved</div>
        <h1>Congratulations, ${name}!</h1>
        <p>Your scholarship <strong>"${scholarshipTitle}"</strong> has been approved and is now live on ScholarHub.</p>
        <p>Students can now view and apply. You'll be notified when new applications arrive.</p>
        <a href="${BASE_URL}/scholarships/${scholarshipId}" class="btn">View Scholarship</a>
    `);

    try { await send(email, `Scholarship Approved: ${scholarshipTitle}`, html, 'scholarship-approved'); }
    catch (err) { console.error('[Resend] sendScholarshipApprovedEmail:', err); }
};

// ─── 4. Scholarship Rejected ──────────────────────────────────────────────────

export const sendScholarshipRejectedEmail = async (
    email: string,
    name: string,
    scholarshipTitle: string,
    reason?: string
) => {
    const html = emailWrapper(`
        <div class="badge" style="background:#ef4444;">Not Approved</div>
        <h1>Hello, ${name}</h1>
        <p>Thank you for submitting <strong>"${scholarshipTitle}"</strong> to ScholarHub.</p>
        <p>After review, we were unable to approve this scholarship at this time.</p>
        ${reason ? `<div class="warn-box"><p style="font-weight:600;margin-bottom:6px;font-size:13px;text-transform:uppercase;">Reason</p><p style="margin-top:4px;">${reason}</p></div>` : ''}
        <p>You can edit and resubmit your scholarship after addressing the feedback.</p>
        <a href="${BASE_URL}/dashboard/scholarships" class="btn">Go to Dashboard</a>
    `);

    try { await send(email, `Scholarship Update: ${scholarshipTitle}`, html, 'scholarship-rejected'); }
    catch (err) { console.error('[Resend] sendScholarshipRejectedEmail:', err); }
};

// ─── 5. New Application → Professor ──────────────────────────────────────────

export const sendNewApplicationEmail = async (
    email: string,
    professorName: string,
    studentName: string,
    scholarshipTitle: string,
    applicationId: string
) => {
    const html = emailWrapper(`
        <div class="badge" style="background:#3b82f6;">New Application</div>
        <h1>Hello, ${professorName}</h1>
        <p><strong>${studentName}</strong> has submitted an application for your scholarship <strong>"${scholarshipTitle}"</strong>.</p>
        <p>Review the application and provide your evaluation from your dashboard.</p>
        <a href="${BASE_URL}/dashboard/applications/${applicationId}" class="btn">Review Application</a>
    `);

    try { await send(email, `New Application: ${scholarshipTitle}`, html, 'new-application'); }
    catch (err) { console.error('[Resend] sendNewApplicationEmail:', err); }
};

// ─── 6. Interview Scheduled ───────────────────────────────────────────────────

export const sendInterviewScheduledEmail = async (
    email: string,
    studentName: string,
    scholarshipTitle: string,
    scheduledAt: Date,
    platform: string,
    meetingLink?: string,
    location?: string,
    duration?: number,
    notes?: string
) => {
    const dateStr = scheduledAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = scheduledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const platformLabel = platform.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const locationOrLink = meetingLink
        ? `<p style="margin:4px 0;"><strong>Link:</strong> <a href="${meetingLink}" style="color:#4f46e5;">${meetingLink}</a></p>`
        : location
        ? `<p style="margin:4px 0;"><strong>Location:</strong> ${location}</p>`
        : '';

    const html = emailWrapper(`
        <div class="badge" style="background:#4f46e5;">Interview Scheduled</div>
        <h1>Hello, ${studentName}</h1>
        <p>You have been invited to an interview for the scholarship <strong>"${scholarshipTitle}"</strong>.</p>
        <div class="info-box">
          <p style="font-weight:600;margin-bottom:10px;font-size:13px;text-transform:uppercase;">Interview Details</p>
          <p style="margin:4px 0;"><strong>Date:</strong> ${dateStr}</p>
          <p style="margin:4px 0;"><strong>Time:</strong> ${timeStr}</p>
          <p style="margin:4px 0;"><strong>Platform:</strong> ${platformLabel}</p>
          <p style="margin:4px 0;"><strong>Duration:</strong> ${duration ?? 60} minutes</p>
          ${locationOrLink}
        </div>
        ${notes ? `<div class="warn-box"><p style="font-weight:600;margin-bottom:6px;font-size:13px;text-transform:uppercase;">Notes from the Committee</p><p style="margin-top:4px;">${notes}</p></div>` : ''}
        <p>Please make sure to be available at the scheduled time. Good luck!</p>
        <a href="${BASE_URL}/applications" class="btn">View My Applications</a>
    `);

    try { await send(email, `Interview Scheduled: ${scholarshipTitle}`, html, 'interview-scheduled'); }
    catch (err) { console.error('[Resend] sendInterviewScheduledEmail:', err); }
};

// ─── 7. Custom Admin Email (reply to contact message) ────────────────────────

export const sendCustomEmail = async (
    to: string,
    subject: string,
    replyMessage: string,
    recipientName?: string
) => {
    const html = emailWrapper(`
        <div class="badge" style="background:#4f46e5;">Message from ScholarHub</div>
        <h1>Hello${recipientName ? `, ${recipientName}` : ''}</h1>
        <div class="info-box">
          <p style="white-space:pre-line;">${replyMessage}</p>
        </div>
        <p>Best regards,<br>The ScholarHub Team</p>
        <a href="${BASE_URL}/contact" class="btn">Visit ScholarHub</a>
    `);

    try { await send(to, subject, html, 'admin-custom-email'); }
    catch (err) { console.error('[Resend] sendCustomEmail:', err); throw new Error('Failed to send email'); }
};

// ─── 8. Profile Milestone ─────────────────────────────────────────────────────

export const sendProfileMilestoneEmail = async (
    email: string,
    name: string,
    milestone: number,
    role: string
) => {
    const milestones: Record<number, { msg: string; next: string }> = {
        100: {
            msg: 'Your profile is now <strong>100% complete</strong>. You\'re all set!',
            next: role === 'STUDENT'
                ? 'You can now apply for scholarships with the best chances of being selected.'
                : 'Your complete profile helps students trust and connect with your opportunities.',
        },
        75: { msg: 'Your profile is <strong>75% complete</strong>. Almost there!',    next: 'Just a few more details to reach 100%.' },
        50: { msg: 'Your profile is <strong>50% complete</strong>. Keep going!',       next: 'Continue to unlock all ScholarHub features.' },
    };
    const m = milestones[milestone] ?? {
        msg: `Your profile is <strong>${milestone}% complete</strong>. Good start!`,
        next: 'Add more information to improve your profile.',
    };

    const html = emailWrapper(`
        <div class="badge" style="background:#10b981;">${milestone}% Complete</div>
        <h1>Great work, ${name}!</h1>
        <p>${m.msg}</p>
        <div class="progress-bar">
          <div style="background:linear-gradient(90deg,#4f46e5,#10b981);height:100%;width:${milestone}%;border-radius:9999px;"></div>
        </div>
        <p>${m.next}</p>
        <a href="${BASE_URL}/profile" class="btn">Complete Your Profile</a>
    `);

    try { await send(email, `Profile ${milestone}% Complete — ScholarHub`, html, 'profile-milestone'); }
    catch (err) { console.error('[Resend] sendProfileMilestoneEmail:', err); }
};
