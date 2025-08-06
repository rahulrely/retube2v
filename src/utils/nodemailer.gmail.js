import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  generateVerificationEmailHTML,
  generateInviteCodeEmailHTML,
  primaryuserSuccessEmail,
  secondarySuccessEmail
 } from "../email/mailTemplet.js";

dotenv.config();
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_TEMP_EMAIL,
    pass: process.env.GMAIL_TEMP_EMAIL_APP_PASS, 
  },
});

// --- Email Sending Functions ---

const sendVerificationEmail = async (email, name, verifyCode) => {
  const emailHTML = generateVerificationEmailHTML(name,verifyCode);

  try {
    await transporter.sendMail({
      from: `"Retube" <${process.env.EMAIL}>`, 
      to: email, 
      subject: "Retube | Verification Code",
      html: emailHTML,
    });
    console.log(`Verification email sent successfully to ${email}`);
    return { message: "OTP sent successfully", email };
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};


const sendInviteCodeEmail = async (email, name, inviteCode,pdfBuffer) => {
  
  const emailHTML = generateInviteCodeEmailHTML(name,email,inviteCode);

  try {
    await transporter.sendMail({
      from: `"Retube" <${process.env.EMAIL}>`,
      to: email,
      subject: "Retube | Invite Code",
      html: emailHTML,
      // Assume 'pdfBuffer' is a variable holding your PDF data
      attachments: [{
          filename: 'inviteCode.pdf',
          content: pdfBuffer, // Attach content directly from a buffer
          contentType: 'application/pdf'
      }]
    });
    console.log(`Invite code email sent successfully to ${email}`);
    return { message: "Invite code sent successfully", email };
  } catch (error) {
    console.error(`Failed to send invite code email to ${email}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};


const sendPrimarySuccessEmail = async (email, name) => {
  
  const emailHTML = primaryuserSuccessEmail(name);

  try {
    await transporter.sendMail({
      from: `"Retube" <${process.env.EMAIL}>`,
      to: email,
      subject: "Retube | Successful Registration",
      html: emailHTML,
    });
    console.log(`Primary success email sent successfully to ${email}`);
    return { message: "Registration email sent successfully", email };
  } catch (error) {
    console.error(`Failed to send primary success email to ${email}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const sendSecondarySuccessEmail = async (email, name, primaryName) => {

  const emailHTML = secondarySuccessEmail(name,primaryName);

  try {
    await transporter.sendMail({
      from: `"Retube" <${process.env.EMAIL}>`,
      to: email,
      subject: "Retube | Successful Registration",
      html: emailHTML,
    });
    console.log(`Secondary success email sent successfully to ${email}`);
    return { message: "Registration email sent successfully", email };
  } catch (error) {
    console.error(`Failed to send secondary success email to ${email}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export {
  sendVerificationEmail,
  sendInviteCodeEmail,
  sendPrimarySuccessEmail,
  sendSecondarySuccessEmail,
};