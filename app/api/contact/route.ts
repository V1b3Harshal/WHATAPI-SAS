// app/api/contact/route.ts
import nodemailer from "nodemailer";

// --- In-Memory Rate Limit and Cooldown Stores ---
// These maps exist per-instance. In production, consider using a shared data store.
const ipRateLimitStore: Map<string, number[]> = new Map();
const emailRateLimitStore: Map<string, number[]> = new Map();
const contactCooldownStore: Map<string, number> = new Map();

// --- Configuration ---
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds window.
const MAX_REQUESTS_PER_IP = 5;        // Maximum 5 requests per IP per window.
const MAX_REQUESTS_PER_EMAIL = 3;     // Maximum 3 requests per email per window.
const COOLDOWN_PERIOD = 60 * 1000;      // 60 seconds cooldown between successive requests.

// --- Helper Functions ---
function checkRateLimit(
  key: string,
  store: Map<string, number[]>,
  maxRequests: number
): boolean {
  const now = Date.now();
  const timestamps = store.get(key) || [];
  // Keep only timestamps within the valid window.
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  if (recentTimestamps.length >= maxRequests) {
    store.set(key, recentTimestamps);
    return true;
  }
  recentTimestamps.push(now);
  store.set(key, recentTimestamps);
  return false;
}

function isInCooldown(email: string): boolean {
  const lastRequestTime = contactCooldownStore.get(email);
  if (lastRequestTime && Date.now() - lastRequestTime < COOLDOWN_PERIOD) {
    return true;
  }
  contactCooldownStore.set(email, Date.now());
  return false;
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Extract the client's IP.
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Parse JSON body.
    const data = await request.json();
    const { firstName, lastName, email, subject, message } = data;

    // Basic validation of required fields.
    if (!firstName || !lastName || !email || !message) {
      return new Response(
        JSON.stringify({ message: "Missing required fields." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Apply IP-based rate limiting.
    if (checkRateLimit(ip, ipRateLimitStore, MAX_REQUESTS_PER_IP)) {
      return new Response(
        JSON.stringify({ message: "Too many requests from this IP, please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Apply email-based rate limiting.
    if (checkRateLimit(email, emailRateLimitStore, MAX_REQUESTS_PER_EMAIL)) {
      return new Response(
        JSON.stringify({ message: "Too many requests for this email, please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Apply a cooldown per email.
    if (isInCooldown(email)) {
      return new Response(
        JSON.stringify({ message: "Please wait a moment before sending another message." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create the Nodemailer transporter.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // true for port 465, false for others.
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Use with caution in production.
      },
    });

    // Verify the SMTP connection.
    await transporter.verify();
    console.log("SMTP connection verified.");

    // Setup email data for the business (notification) email.
    const businessMailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_FROM, // Change if you want to use a different recipient.
      subject: subject || "New Contact Form Submission",
      text: `
You have a new contact form submission:

Name: ${firstName} ${lastName}
Email: ${email}
Subject: ${subject}
Message:
${message}
      `,
    };

    // Send the business email.
    const businessInfo = await transporter.sendMail(businessMailOptions);
    console.log("Business email sent:", businessInfo);

    // Setup email data for a confirmation message to the user.
    const confirmationMailOptions = {
      from: process.env.EMAIL_FROM,
      to: email, // Send confirmation to the user's email address.
      subject: "Thank you for contacting us",
      text: `
Hi ${firstName},

Thank you for reaching out to us. We have received your message and will get back to you shortly.

Best regards,
The Team
      `,
    };

    // Send confirmation email (log errors but don't block the response).
    try {
      const confirmationInfo = await transporter.sendMail(confirmationMailOptions);
      console.log("Confirmation email sent:", confirmationInfo);
    } catch (confError) {
      console.error("Error sending confirmation email:", confError);
    }

    // Return a success response.
    return new Response(
      JSON.stringify({
        message: "Thank you for contacting us. We will reach you shortly.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ message: "Internal Server Error", error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
