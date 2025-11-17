import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER!;
const EMAIL_PASS = process.env.EMAIL_PASS!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173' || '';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});


// Helper function to send verification/reset email (placeholder; integrate with your email service, e.g., nodemailer)
export const sendEmail = async (
  to: string,
  subject: string,
  token: string,
  type: "verification" | "reset" | "admin-alert" | "approval" | "rejection",
  name?: string
): Promise<void> => {
  try {
    const verificationUrl = `${FRONTEND_URL}/auth/verify/${token}`;
    const resetUrl = `${FRONTEND_URL}/auth/reset/${token}`;
    const approveUrl = `${FRONTEND_URL}/properties`;
    const rejectUrl = `${FRONTEND_URL}/agent/rejected`;

    const displayName = name || to.split("@")[0];

    let mainContent = "";

    // -------- EMAIL CONTENT HANDLING ---------
    switch (type) {
      case "verification":
        mainContent = `
          <h3>Email Verification</h3>
          <p>Hello ${displayName},</p>
          <p>Welcome to ATW HQ. Please verify your email below.</p>
          <div style="text-align:center; margin:25px 0;">
            <a href="${verificationUrl}" style="
              background:#10B981;
              color:white;
              padding:12px 28px;
              text-decoration:none;
              border-radius:6px;
            ">Verify Email</a>
          </div>
        `;
        break;

      case "reset":
        mainContent = `
          <h3>Password Reset</h3>
          <p>Hello ${displayName},</p>
          <p>Click below to reset your password.</p>
          <div style="text-align:center; margin:25px 0;">
            <a href="${resetUrl}" style="
              background:#EF4444;
              color:white;
              padding:12px 28px;
              text-decoration:none;
              border-radius:6px;
            ">Reset Password</a>
          </div>
        `;
        break;

      case "admin-alert":
        mainContent = `
          <h3>New Agent Registration</h3>
          <p>Hello Admin,</p>
          <p>A new agent <strong>${displayName}</strong> has registered and is pending approval.</p>
          <p>Log in to your admin dashboard to review their account.</p>
        `;
        break;

      case "approval":
        mainContent = `
          <h3>Account Approved</h3>
          <p>Hello ${displayName},</p>
          <p>Your ATW HQ agent account has been approved. You can now log in and start posting properties.</p>
          <div style="text-align:center; margin:25px 0;">
            <a href="${approveUrl}" style="
              background:#3B82F6;
              color:white;
              padding:12px 28px;
              text-decoration:none;
              border-radius:6px;
            ">Continue</a>
          </div>
        `;
        break;

      case "rejection":
        mainContent = `
          <h3>Application Rejected</h3>
          <p>Hello ${displayName},</p>
          <p>We are sorry, your agent application was not approved.</p>
          <p><strong>Reason:</strong> ${token || 'Insufficient details provided'}</p>
          <p>If you believe this was a mistake, you can contact support.</p>
          <div style="text-align:center; margin:25px 0;">
            <a href="${rejectUrl}" style="
              background:#6B7280;
              color:white;
              padding:12px 28px;
              text-decoration:none;
              border-radius:6px;
            ">View Details</a>
          </div>
        `;
        break;
    }

    // FINAL EMAIL TEMPLATE
    const htmlTemplate = `
      <div style="font-family:Arial; background:#f4f4f4; padding:30px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <table width="600" style="background:white; border-radius:10px;">
                
                <tr>
                  <td style="background:#111827; padding:20px; text-align:center;">
                    <h2 style="color:white;">ATW HQ</h2>
                  </td>
                </tr>

                <tr>
                  <td style="padding:30px 40px; color:#333;">
                    ${mainContent}
                  </td>
                </tr>

                <tr>
                  <td style="background:#F3F4F6; padding:15px; text-align:center; color:#6B7280;">
                    © ${new Date().getFullYear()} ATW HQ. All rights reserved.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    await transporter.sendMail({
      from: `"ATW HQ" <${EMAIL_USER}>`,
      to,
      subject,
      html: htmlTemplate,
    });

    console.log(`Email sent to ${to} for ${type}`);
  } catch (error: any) {
    console.error("Email error:", error.message);
  }
};

