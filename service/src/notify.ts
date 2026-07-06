export interface Notifier {
  sendEmail(subject: string, body: string): void;
  sendSms(body: string): void;
}

export class ConsoleNotifier implements Notifier {
  sendEmail(subject: string, body: string): void {
    console.log(`[email] ${subject} :: ${body}`);
  }

  sendSms(body: string): void {
    console.log(`[sms] ${body}`);
  }
}
