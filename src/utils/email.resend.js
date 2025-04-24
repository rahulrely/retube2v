import { Resend } from "resend";
import {
  generateVerificationEmailHTML,
  generateInviteCodeEmailHTML,
  primaryuserSuccessEmail,
  secondarySuccessEmail
 } from "../email/mailTemplet.js";
import { APIError } from "./APIError.js";

// Load API key securely from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send a verification email
const sendVerificationEmail = async (email,name,verifyCode) => {

  // Email HTML template
  const emailHTML = generateVerificationEmailHTML(name,verifyCode)

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

// Function to send a inviteCode email
const sendInviteCodeEmail = async (email,name,inviteCode) => {

  // Email HTML template
  const emailHTML = generateInviteCodeEmailHTML(name,email,inviteCode)

  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Retube | Invite Code",
      html: emailHTML,
    });

    if (error) {
      throw new APIError(500,error.message);
    }

    return { message: "inviteCode successfully", email };
  } catch (err) {
    throw new APIError(500,`Failed to send email: ${err.message}`);
  }
};

// Function to send a primary user success email
const sendPrimarySuccessEmail = async (email,name) => {

  // Email HTML template
  const emailHTML = primaryuserSuccessEmail(name)

  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Retube | Successful Registration",
      html: emailHTML,
    });

    if (error) {
      throw new APIError(500,error.message);
    }

    return { message: "regsitration primary sent successfully", email };
  } catch (err) {
    throw new APIError(500,`Failed to send primary user email: ${err.message}`);
  }
};

// Function to send a secondary user success email
const sendSecondarySuccessEmail = async (email,name) => {

  // Email HTML template
  const emailHTML = secondarySuccessEmail(name,primaryName)

  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Retube | Successful Registration",
      html: emailHTML,
    });

    if (error) {
      throw new APIError(500,error.message);
    }

    return { message: "regsitration secondary sent successfully", email };
  } catch (err) {
    throw new APIError(500,`Failed to send secondary user email: ${err.message}`);
  }
};

// Export the function for use in other files
export { 
  sendVerificationEmail,
  sendInviteCodeEmail,
  sendPrimarySuccessEmail,
  sendSecondarySuccessEmail
};
