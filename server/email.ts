import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = process.env.MAILERSEND_KEY ? new MailerSend({ apiKey: process.env.MAILERSEND_KEY }) : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    if (!mailerSend) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('MAILERSEND_KEY is required in production');
        }
        console.log(`[DEV] Password reset link for ${to}: ${resetUrl}`);
        return;
    }

    const from = process.env.MAILERSEND_FROM ?? 'noreply@resend.dev';
    const emailParams = new EmailParams()
        .setFrom(new Sender(from, 'SchoolAdmin'))
        .setTo([new Recipient(to)])
        .setSubject('Reset your password')
        .setHtml(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 16px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px">
    <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px">Reset your password</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px">
      We received a request to reset the password for your SchoolAdmin account.
      Click the button below — this link expires in <strong>1 hour</strong>.
    </p>
    <a href="${resetUrl}"
       style="display:inline-block;background:#2563eb;color:#fff;font-size:14px;font-weight:600;
              padding:12px 24px;border-radius:8px;text-decoration:none">
      Reset password
    </a>
    <p style="font-size:12px;color:#9ca3af;margin:24px 0 0">
      If you didn't request this, you can safely ignore this email.<br>
      Or copy this link: <a href="${resetUrl}" style="color:#6b7280">${resetUrl}</a>
    </p>
  </div>
</body>
</html>`)
        .setText(`Reset your SchoolAdmin password\n\nClick this link (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`);

    await mailerSend.email.send(emailParams);
}
