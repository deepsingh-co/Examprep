import nodemailer from "nodemailer";

const hasSmtpConfig = () => {
  return process.env.SMTP_USER && process.env.SMTP_PASS && !process.env.SMTP_USER.includes("your_");
};

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  if (!hasSmtpConfig()) {
    console.log("\n==============================================");
    console.log("⚠️  SMTP not configured — verification link:");
    console.log(verifyUrl);
    console.log("==============================================\n");
    return { devLink: verifyUrl };
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "IntelliExam — Verify Your Email",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:30px;background:#1a1a2e;border-radius:12px;color:#e0e0e0;">
        <h2 style="color:#6c63ff;text-align:center;">IntelliExam</h2>
        <p>Thanks for signing up! Please verify your email address to get started.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${verifyUrl}" style="background:#6c63ff;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Verify Email</a>
        </div>
        <p style="font-size:12px;color:#888;">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
};

export const sendAnnotationEmail = async (email, feedback) => {
  if (!hasSmtpConfig()) {
    console.log(`\n[dev] Annotation email to ${email}: ${feedback}\n`);
    return;
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "IntelliExam — New Feedback from Your Instructor",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:30px;background:#1a1a2e;border-radius:12px;color:#e0e0e0;">
        <h2 style="color:#6c63ff;text-align:center;">IntelliExam</h2>
        <p>Your instructor has left you some feedback on a recent test attempt:</p>
        <div style="background:#16213e;padding:16px;border-radius:8px;margin:20px 0;">
          <p style="margin:0;">${feedback}</p>
        </div>
        <p style="font-size:12px;color:#888;">Log in to view full details.</p>
      </div>
    `,
  });
};