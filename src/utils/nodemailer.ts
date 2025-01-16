import nodemailer, { Transporter, SendMailOptions } from "nodemailer";

// Ensure environment variables are defined
const email: string | undefined = process.env.EMAIL_USER;
const password: string | undefined = process.env.EMAIL_PASS;

if (!email || !password) {
  throw new Error("Missing email or password environment variables");
}

// Create a Transporter instance
export const transporter: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: password,
  },
});

// Define mail options with the correct types
export const mailOptions: SendMailOptions = {
  from: email,
  to: email,
};
