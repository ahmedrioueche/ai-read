import { generateEmailContent } from "@/utils/helper";
import { transporter } from "@/utils/nodemailer";
import { SendMailOptions } from "nodemailer";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await req.json();
    const { email, subject, content } = data;
    console.log("email", email);
    console.log("subject", subject);
    console.log("content", content);

    if (!email || !subject || !content) {
      return new Response(JSON.stringify({ message: "Bad request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      ...generateEmailContent(content),
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to send email:", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
