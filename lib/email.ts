import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false // This bypasses certificate validation
    }
});

export async function sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ) {
    await transporter.sendMail({
      from: `"Connect API" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Fallback text version
    });
  }

// Add this to your existing email file (likely @/lib/mailer.ts)
export async function sendMagicLinkEmail(email: string, verificationUrl: string) {
    const subject = "Your Magic Link for Connect API";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Connect API Login</h2>
        <p style="font-size: 16px;">Click the button below to securely log in to your account:</p>
        
        <div style="margin: 40px 0; text-align: center;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; 
                    color: white; 
                    padding: 12px 24px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 500;
                    display: inline-block;">
            Sign In Now
          </a>
        </div>
  
        <p style="font-size: 14px; color: #4b5563;">
          If you didn't request this login link, you can safely ignore this email. 
          The link will expire in 15 minutes for security reasons.
        </p>
  
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
  
        <p style="font-size: 12px; color: #6b7280;">
          Can't click the button? Copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">
            ${verificationUrl}
          </a>
        </p>
      </div>
    `;
  
    const text = `Sign in to Connect API:\n${verificationUrl}\n\nThis link expires in 15 minutes.`;
  
    await sendEmail(email, subject, html, text);
  }