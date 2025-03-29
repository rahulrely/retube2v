import Resend from "resend";
import {generateEmailHTML} from "../email/VerifyMailTemplet.js";
import APIError from "../utils/APIError.js";

// Load API key securely from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send a verification email
const sendVerificationEmail = async (email,name) => {

  // Email HTML template
  const emailHTML = generateEmailHTML(name,verifyCode)

  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Retube | Verification Code",
      html: emailHTML,
    });

    if (error) {
      throw new APIError(500,error.message);
    }

    return { message: "OTP sent successfully", email };
  } catch (err) {
    throw new APIError(500,`Failed to send email: ${err.message}`);
  }
};

// Export the function for use in other files
export {sendVerificationEmail};
