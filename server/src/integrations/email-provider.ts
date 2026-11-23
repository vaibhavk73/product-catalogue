
import nodemailer from "nodemailer";
import { z } from "zod";

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

  const port = Number(SMTP_PORT);
  const invalidAuth = Boolean(SMTP_USER) !== Boolean(SMTP_PASSWORD);
  if (!SMTP_HOST || !Number.isInteger(port) || port < 1 || port > 65535 || invalidAuth || !z.string().email().safeParse(SALES_EMAIL).success) {
    throw new Error("Email service is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth:
      SMTP_USER && SMTP_PASSWORD
        ? {
            user: SMTP_USER,
            pass: SMTP_PASSWORD,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: SALES_EMAIL,
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
