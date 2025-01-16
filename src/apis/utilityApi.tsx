import axios from "axios";

export class EmailApi {
  sendEmail = async (email: string, subject: string, content: string) => {
    try {
      const response = await axios.post(
        "/api/email",
        {
          email,
          subject,
          content,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  };
}
