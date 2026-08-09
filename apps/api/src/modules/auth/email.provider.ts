export interface EmailProvider {
  name: string;
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
}

// No SMTP/email API key is configured in this project. This provider logs
// the reset link instead of sending it, so the password-reset flow is
// fully testable in local development without inventing credentials. Swap
// in a real provider (e.g. Resend, SendGrid) behind this same interface by
// setting EMAIL_PROVIDER and reading its API key from the environment.
export const consoleEmailProvider: EmailProvider = {
  name: "console-dev-provider",
  async sendPasswordResetEmail(to: string, resetUrl: string) {
    // eslint-disable-next-line no-console
    console.log(`[suzume] Password reset requested for ${to}: ${resetUrl}`);
  },
};

export function resolveEmailProvider(): EmailProvider {
  const configured = process.env.EMAIL_PROVIDER;
  if (!configured || configured === "console") {
    return consoleEmailProvider;
  }
  console.warn(`Unknown EMAIL_PROVIDER "${configured}", falling back to the console dev provider.`);
  return consoleEmailProvider;
}
