import { EmailApi } from "@/apis/utilityApi";

export class AppAlerts {
  private emailApi: EmailApi;
  private EMAIL = "ai.read.sigma@gmail.com";

  constructor() {
    this.emailApi = new EmailApi();
  }

  private async sendAlert(email: string, subject: string, content: string) {
    try {
      await this.emailApi.sendEmail(email, subject, content);
      console.log(`Alert sent: ${subject}`);
    } catch (error) {
      console.error(`Failed to send alert: ${subject}`, error);
    }
  }

  public async sendNewVisitorAlert() {
    const subject = "New Visitor Alert";
    const content = "A new visitor has arrived.";
    await this.sendAlert(this.EMAIL, subject, content);
  }

  public async sendNewUserAlert(userData: string) {
    const subject = "New User Alert";
    const content = `A new user: ${userData} has registered.`;
    await this.sendAlert(this.EMAIL, subject, content);
  }

  public async sendUserLoginAlert(userData: string) {
    const subject = "User Log in Alert";
    const content = `A new user: ${userData} has logged in.`;
    await this.sendAlert(this.EMAIL, subject, content);
  }

  public async sendNewPaymentAlert(userData: string, paymentDetails: string) {
    const subject = "New Payment Alert";
    const content = `A new payment has been processed, user: ${userData}, Details: ${paymentDetails}`;
    await this.sendAlert(this.EMAIL, subject, content);
  }

  public async sendErrorAlert(errorDetails: string) {
    const subject = "Error Alert";
    const content = `An error has occurred: ${errorDetails}`;
    await this.sendAlert(this.EMAIL, subject, content);
  }

  public async sendWarningAlert(warningDetails: string) {
    const subject = "Warning Alert";
    const content = `A warning has been triggered: ${warningDetails}`;
    await this.sendAlert(this.EMAIL, subject, content);
  }
}
