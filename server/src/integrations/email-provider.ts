
import nodemailer from "nodemailer";

interface EnquiryEmail {
  name: string;
  email: string;
  product: string;
  message: string;
}

export async function sendEnquiryEmail(
  enquiry: EnquiryEmail
): Promise<void> {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SALES_EMAIL,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SALES_EMAIL) {
    throw new Error("Email service is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth:
      SMTP_USER && SMTP_PASSWORD
        ? {
            user: SMTP_USER,
            pass: SMTP_PASSWORD,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: SMTP_USER || SALES_EMAIL,
    to: SALES_EMAIL,
    replyTo: enquiry.email,
    subject: `Product enquiry: ${enquiry.product}`,
    text: `
New product enquiry

Name: ${enquiry.name}
Email: ${enquiry.email}
Product: ${enquiry.product}

Message:
${enquiry.message}
    `,
  });
}
