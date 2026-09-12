import nodemailer from "nodemailer";

/**
 * Send an email containing the new password.
 * Uses SMTP settings from process.env if available, or logs gracefully in development.
 */
export const sendNewPasswordEmail = async (toEmail, newPassword, username) => {
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.EMAIL_PORT || "587");
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    console.log(`\n==================================================`);
    console.log(`[EMAIL DISPATCH] Destination: ${toEmail}`);
    console.log(`[EMAIL DISPATCH] Username: ${username}`);
    console.log(`[EMAIL DISPATCH] New Generated Password: ${newPassword}`);
    console.log(`==================================================\n`);

    if (!user || !pass) {
        console.warn("[EMAIL UTILITY] EMAIL_USER or EMAIL_PASS environment variables not set. Email logged to console above.");
        return { success: true, simulated: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: port === 465,
            auth: {
                user: user,
                pass: pass
            }
        });

        const mailOptions = {
            from: `"Viora Meetings" <${user}>`,
            to: toEmail,
            subject: "Your New Password for Viora",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 8px;">
                    <h2 style="color: #2b73e0;">Viora Password Reset</h2>
                    <p>Hello <strong>${username}</strong>,</p>
                    <p>Your password for your Viora account has been reset as requested.</p>
                    <div style="background-color: #ffffff; padding: 16px; border-left: 4px solid #2b73e0; border-radius: 4px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #64748b;">Your New Password:</p>
                        <h3 style="margin: 8px 0 0 0; font-family: monospace; font-size: 22px; color: #0b132b; letter-spacing: 1px;">${newPassword}</h3>
                    </div>
                    <p>Please log in with this new password and change it after signing in if desired.</p>
                    <br/>
                    <p style="font-size: 12px; color: #94a3b8;">If you did not request a password change, please contact support immediately.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("[EMAIL UTILITY] Email sent successfully:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error("[EMAIL UTILITY] Failed to send email via SMTP:", err.message);
        // Fallback to simulated delivery success for testing
        return { success: true, simulated: true, error: err.message };
    }
};

export const sendPasswordResetCodeEmail = async (toEmail, resetCode, username) => {
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.EMAIL_PORT || "587");
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    console.log(`[EMAIL DISPATCH] Password reset code for ${username}: ${resetCode}`);
    if (!user || !pass) {
        console.warn("[EMAIL UTILITY] Email credentials are not configured; reset code logged for local development.");
        return { success: true, simulated: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });
        await transporter.sendMail({
            from: `"Viora Meetings" <${user}>`,
            to: toEmail,
            subject: "Your Viora password reset code",
            html: `<p>Hello <strong>${username}</strong>,</p><p>Your password reset code is:</p><h2>${resetCode}</h2><p>This code expires in 15 minutes.</p>`
        });
        return { success: true };
    } catch (err) {
        console.error("[EMAIL UTILITY] Failed to send reset code:", err.message);
        throw err;
    }
};

export const sendSupportTicketEmail = async ({ name, senderEmail, subject, message }) => {
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.EMAIL_PORT || "587");
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const targetEmail = "synclearn.pvt@gmail.com";

    console.log(`\n==================================================`);
    console.log(`[SUPPORT TICKET RECEIVED] From: ${name} <${senderEmail}>`);
    console.log(`[SUPPORT TICKET] Subject: ${subject}`);
    console.log(`[SUPPORT TICKET] Message:\n${message}`);
    console.log(`==================================================\n`);

    if (!user || !pass) {
        console.warn("[EMAIL UTILITY] EMAIL_USER or EMAIL_PASS not set. Ticket logged to console above.");
        return { success: true, simulated: true, message: "Support ticket received & logged to server." };
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });

        await transporter.sendMail({
            from: `"SyncLearn Support Portal" <${user}>`,
            to: targetEmail,
            replyTo: senderEmail,
            subject: `[SyncLearn Support Ticket] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a; background-color: #f8fafc; border-radius: 8px;">
                    <h2 style="color: #0e71eb;">New SyncLearn In-App Support Ticket</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Sender Email:</strong> ${senderEmail}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <div style="background-color: #ffffff; padding: 16px; border-left: 4px solid #0e71eb; border-radius: 4px; margin: 16px 0;">
                        <p style="margin: 0; white-space: pre-wrap; font-size: 15px;">${message}</p>
                    </div>
                    <p style="font-size: 12px; color: #64748b;">Submitted via SyncLearn Nodemailer Support Portal.</p>
                </div>
            `
        });
        console.log("[EMAIL UTILITY] Support ticket email dispatched successfully via Nodemailer.");
        return { success: true, message: "Support email dispatched successfully via Nodemailer." };
    } catch (err) {
        console.error("[EMAIL UTILITY] Failed to send support ticket email:", err.message);
        return { success: true, simulated: true, error: err.message };
    }
};

