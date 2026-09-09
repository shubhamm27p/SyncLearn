const sgMail = require('@sendgrid/mail');

const sendOTPEmail = async (email, otp, name) => {
  console.log('Attempting to send OTP via SendGrid to:', email);
  console.log('SendGrid API key exists:', !!process.env.SENDGRID_API_KEY);

  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not set in environment variables');
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: {
      email: process.env.SMTP_USER || 'mominjaish10@gmail.com',
      name: 'Digital Microsys'
    },
    subject: 'Your OTP for Digital Microsys Registration',
    text: `Your OTP is: ${otp}. Valid for 10 minutes.`,
    html: `
      <div style="font-family:Arial,
        sans-serif;max-width:480px;
        margin:0 auto;padding:20px;">
        <div style="background:#2563eb;
          padding:24px;
          border-radius:12px 12px 0 0;
          text-align:center;">
          <h1 style="color:#fff;margin:0;
            font-size:22px;">
            Digital Microsys
          </h1>
        </div>
        <div style="background:#fff;
          padding:32px;
          border:1px solid #e5e7eb;
          border-top:none;
          border-radius:0 0 12px 12px;">
          <h2 style="color:#111827;
            font-size:18px;
            margin:0 0 16px;">
            Hello ${name || 'Student'}!
          </h2>
          <p style="color:#6b7280;
            margin:0 0 24px;">
            Your OTP for Digital Microsys 
            registration is:
          </p>
          <div style="background:#eff6ff;
            border:2px dashed #2563eb;
            border-radius:10px;
            padding:20px;
            text-align:center;
            margin-bottom:24px;">
            <h1 style="color:#2563eb;
              font-size:42px;
              font-weight:800;
              letter-spacing:10px;
              margin:0;">
              ${otp}
            </h1>
            <p style="color:#9ca3af;
              font-size:12px;
              margin:8px 0 0;">
              Valid for 10 minutes only
            </p>
          </div>
          <p style="color:#ef4444;
            font-size:13px;margin:0;">
            Do not share this OTP 
            with anyone.
          </p>
        </div>
        <p style="color:#9ca3af;
          font-size:11px;
          text-align:center;
          margin-top:16px;">
          © 2026 Digital Microsys
        </p>
      </div>
    `
  };

  try {
    const response = await sgMail.send(msg);
    console.log('SendGrid OTP email sent successfully:', {
      statusCode: response[0].statusCode,
      to: email
    });
    return response;
  } catch (error) {
    console.error('SendGrid error:', {
      message: error.message,
      code: error.code,
      response: error.response?.body
    });
    throw error;
  }
};

module.exports = { sendOTPEmail };
