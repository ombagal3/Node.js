const nodemailer = require('nodemailer');

let transporterInstance = null;

const createMailTransporter = async () => {
  if (transporterInstance) {
    return transporterInstance;
  }

  // If explicit SMTP credentials are provided in .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporterInstance;
  }

  // Fallback for development/testing: create Ethereal test account or mock transport
  if (process.env.NODE_ENV === 'test') {
    transporterInstance = {
      sendMail: async (mailOptions) => ({
        messageId: 'test-mock-mail-id',
        response: '250 Mock email accepted',
        envelope: mailOptions,
      }),
    };
    return transporterInstance;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    transporterInstance = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Mail] Ethereal test email account initialized: ${testAccount.user}`);
    return transporterInstance;
  } catch (err) {
    console.warn(`[Mail] Could not initialize Ethereal mail account: ${err.message}. Using simulated transporter.`);
    transporterInstance = {
      sendMail: async (mailOptions) => {
        console.log(`[Mail Simulation] Sending email to: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
        return { messageId: 'simulated-id', response: 'Simulated email sent' };
      },
    };
    return transporterInstance;
  }
};

module.exports = { createMailTransporter };
