import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = process.env.MAILERSEND_KEY ? new MailerSend({ apiKey: process.env.MAILERSEND_KEY }) : null;

type EmailLanguage = 'en' | 'lt';

interface ResetEmailCopy {
    subject: string;
    heading: string;
    body: string;
    expires: string;
    button: string;
    ignoreNote: string;
    copyLink: string;
    textBody: (resetUrl: string) => string;
}

const RESET_EMAIL_COPY: Record<EmailLanguage, ResetEmailCopy> = {
    en: {
        subject: 'Reset your password',
        heading: 'Reset your password',
        body: 'We received a request to reset the password for your SchoolAdmin account. Click the button below — this link expires in',
        expires: '1 hour',
        button: 'Reset password',
        ignoreNote: "If you didn't request this, you can safely ignore this email.",
        copyLink: 'Or copy this link:',
        textBody: (resetUrl) =>
            `Reset your SchoolAdmin password\n\nClick this link (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
    },
    lt: {
        subject: 'Atkurkite slaptažodį',
        heading: 'Atkurkite slaptažodį',
        body: 'Gavome prašymą atkurti jūsų „SchoolAdmin“ paskyros slaptažodį. Spauskite mygtuką žemiau — nuoroda galioja',
        expires: '1 valandą',
        button: 'Atkurti slaptažodį',
        ignoreNote: 'Jei šio prašymo nepateikėte, galite drąsiai ignoruoti šį laišką.',
        copyLink: 'Arba nukopijuokite šią nuorodą:',
        textBody: (resetUrl) =>
            `Atkurkite „SchoolAdmin“ slaptažodį\n\nSpauskite šią nuorodą (galioja 1 valandą):\n${resetUrl}\n\nJei šio prašymo nepateikėte, ignoruokite šį laišką.`,
    },
};

export async function sendPasswordResetEmail(to: string, resetUrl: string, language: EmailLanguage = 'en'): Promise<void> {
    const copy = RESET_EMAIL_COPY[language] ?? RESET_EMAIL_COPY.en;

    if (!mailerSend) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('MAILERSEND_KEY is required in production');
        }
        console.log(`[DEV] Password reset link for ${to} (${language}): ${resetUrl}`);
        return;
    }

    const from = process.env.MAILERSEND_FROM ?? 'noreply@resend.dev';
    const emailParams = new EmailParams()
        .setFrom(new Sender(from, 'SchoolAdmin'))
        .setTo([new Recipient(to)])
        .setSubject(copy.subject)
        .setHtml(`
<!DOCTYPE html>
<html lang="${language}">
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 16px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px">
    <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px">${copy.heading}</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px">
      ${copy.body} <strong>${copy.expires}</strong>.
    </p>
    <a href="${resetUrl}"
       style="display:inline-block;background:#2563eb;color:#fff;font-size:14px;font-weight:600;
              padding:12px 24px;border-radius:8px;text-decoration:none">
      ${copy.button}
    </a>
    <p style="font-size:12px;color:#9ca3af;margin:24px 0 0">
      ${copy.ignoreNote}<br>
      ${copy.copyLink} <a href="${resetUrl}" style="color:#6b7280">${resetUrl}</a>
    </p>
  </div>
</body>
</html>`)
        .setText(copy.textBody(resetUrl));

    await mailerSend.email.send(emailParams);
}
