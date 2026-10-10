const { createMailTransporter } = require('../config/mail');

/**
 * Send Password Reset OTP Email
 */
const sendPasswordResetOtpEmail = async (email, name, otp) => {
  const transporter = await createMailTransporter();
  const from = process.env.EMAIL_FROM || '"Secure Multi-User System" <no-reply@secureauth.com>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
      <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; letter-spacing: -0.5px;">Password Reset Request</h1>
        <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px;">Secure Multi-User Management System</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; margin: 0 0 16px 0; color: #cbd5e1;">Hello <strong style="color: #ffffff;">${name || 'User'}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
          We received a request to reset your password. Use the verification code below to complete your password reset. This code is valid for <strong>5 minutes</strong>.
        </p>
        <div style="background-color: #1e293b; border: 1px dashed #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #818cf8; font-family: monospace;">${otp}</span>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 24px 0 0 0;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
      <div style="background-color: #020617; padding: 16px 24px; text-align: center; font-size: 12px; color: #475569; border-top: 1px solid #1e293b;">
        &copy; ${new Date().getFullYear()} Secure Multi-User Management System. All rights reserved.
      </div>
    </div>
  `;

  const mailOptions = {
    from,
    to: email,
    subject: 'Your Password Reset Verification Code',
    text: `Your password reset code is: ${otp}. It will expire in 5 minutes.`,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = {
  sendPasswordResetOtpEmail,
};
