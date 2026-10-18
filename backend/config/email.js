import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ------------------------------------------------------------------
// Send email using Brevo's REST API (port 443, always open)
// ------------------------------------------------------------------
export const sendEmail = async (mailOptions) => {
  try {
    const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASSWORD;
    const senderEmail = process.env.EMAIL_USER; // verified sender email

    // Validate configuration
    if (!apiKey) {
      console.error('❌ Missing Brevo API key. Set BREVO_API_KEY in .env');
      return {
        success: false,
        error: 'Missing Brevo API key. Please configure your environment.',
      };
    }

    if (!senderEmail) {
      console.error('❌ Missing sender email. Set EMAIL_USER in .env');
      return {
        success: false,
        error: 'Missing sender email. Please configure your environment.',
      };
    }

    console.log('📧 Sending email via Brevo API to:', mailOptions.to);

    const response = await axios({
      method: 'post',
      url: 'https://api.brevo.com/v3/smtp/email',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      data: {
        sender: {
          email: senderEmail,
          name: 'KSRCE NEO Portal',
        },
        to: [
          {
            email: mailOptions.to,
          },
        ],
        subject: mailOptions.subject,
        htmlContent: mailOptions.html,
      },
    });

    console.log('✅ Email sent via Brevo API to:', mailOptions.to);
    return { success: true, info: response.data };
  } catch (error) {
    // Log full error details for debugging
    const errorDetails = error.response?.data || error.message;
    console.error('❌ Brevo API error:', errorDetails);

    // Provide user-friendly error message
    let userMessage = 'Failed to send email. Please try again later.';
    if (error.response?.data?.code === 'unauthorized') {
      userMessage =
        'Brevo API key is not enabled or invalid. Please check your API key and ensure transactional email is activated.';
    } else if (error.response?.data?.message) {
      userMessage = error.response.data.message;
    }

    return {
      success: false,
      error: userMessage,
      details: error.response?.data || error.message,
    };
  }
};

// For backward compatibility (if any code imports the transporter directly)
export default { sendEmail };