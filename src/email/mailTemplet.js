const generateVerificationEmailHTML = (name, verifyCode) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; text-align: center;">
    <div style="max-width: 400px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #0F7173; margin-bottom: 10px;">Retube</h1>
        <h2 style="color: #333; font-size: 18px;">Hi ${name},</h2>
        <h2 style="color: #333; font-size: 18px;">Your Verification Code</h2>
        <p style="font-size: 16px; color: #555;">Use the code below to verify your email address.</p>
        <div style="font-size: 24px; font-weight: bold; color: #0F7173; margin: 15px 0;">${verifyCode}</div>
        <p style="font-size: 14px; color: #777;">This verification code is valid for <strong>1 hour</strong>. After that, you'll need to request a new code.</p>
        <p style="font-size: 14px; color: #777;">If you didn’t request this, you can ignore this email.</p>
    </div>
</body>
</html>
  `;
};

const generateInviteCodeEmailHTML = (name ,email,inviteCode) =>{
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Retube Invite Details</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f6f6f6;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.05);">
    <tr>
      <td style="background-color:#0F7173; padding:20px 40px; text-align:center; border-top-left-radius:8px; border-top-right-radius:8px;">
        <h1 style="color:#ffffff; margin:0; font-size:28px;">Retube Invitation</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:30px 40px;">
        <p style="font-size:16px; color:#333;">Hi ${name},</p>
        <p style="font-size:16px; color:#333;">
          You’ve generated an invite for a secondary user on <strong>Retube</strong>.
          Please share the details below with the user you want to invite.
        </p>
        <p style="font-size:16px; color:#333;">They must use this information to register:</p>
        
        <div style="margin-top:20px;">
          <p style="font-size:15px; margin:8px 0;"><strong>Your Email:</strong> ${email}</p>
          <p style="font-size:15px; margin:8px 0;"><strong>Invite Code:</strong></p>
          <p style="font-size:20px; font-weight:bold; color:#0F7173; background-color:#f0f0f0; padding:10px 15px; border-radius:5px; text-align:center;">
            ${inviteCode}
          </p>
        </div>

        <p style="font-size:14px; color:#777; margin-top:30px;">
          Please note: The invited secondary user must complete registration and link their account using the above details within <strong>10 days</strong>. Otherwise, your account may be deleted from Retube for security and policy compliance.
        </p>

        <p style="font-size:16px; margin-top:40px;">Thanks for using Retube,</p>
        <p style="font-size:16px; color:#0F7173; font-weight:bold;">Retube</p>
      </td>
    </tr>
    <tr>
      <td style="background-color:#f0f0f0; text-align:center; padding:15px; font-size:12px; color:#777;">
        © 2025 Retube. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

const primaryuserSuccessEmail = (name) =>{
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Retube</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f9f9f9;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
    <tr>
      <td style="background-color:#0F7173; padding:20px 40px; text-align:center; border-top-left-radius:8px; border-top-right-radius:8px;">
        <h1 style="color:#ffffff; margin:0; font-size:28px;">Welcome to Retube!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:30px 40px;">
        <p style="font-size:16px; color:#333;">Hi ${name},</p>

        <p style="font-size:16px; color:#333;">
          🎉 Congratulations! You've successfully registered as a <strong>Primary User</strong> on <strong>Retube</strong>.
        </p>

        <p style="font-size:16px; color:#333;">
          ✅ Your <strong>Secondary User</strong> has been successfully linked to your Retube account.
        </p>

        <hr style="margin:30px 0; border:none; border-top:1px solid #ddd;"/>

        <h3 style="color:#0F7173;">How Retube Works:</h3>
        <ol style="padding-left:20px; color:#333; font-size:15px;">
          <li>You upload your video to <strong>Retube</strong>.</li>
          <li>Your Secondary User will <strong>download and edit</strong> the video.</li>
          <li>The Secondary User uploads the edited version back to Retube.</li>
          <li>Once you approve it, the video will be published directly to your <strong>YouTube account</strong> with <strong>Private status</strong>.</li>
        </ol>

        <p style="font-size:16px; color:#333; margin-top:30px;">
          We’re excited to have you on board and can’t wait to see your content shine!
        </p>

        <p style="font-size:16px; color:#0F7173; font-weight:bold;">– Retube</p>
      </td>
    </tr>
    <tr>
      <td style="background-color:#f0f0f0; text-align:center; padding:15px; font-size:12px; color:#777;">
        © 2025 Retube. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

const secondarySuccessEmail = (name,primaryName) =>{
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Retube</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f9f9f9;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
    <tr>
      <td style="background-color:#0F7173; padding:20px 40px; text-align:center; border-top-left-radius:8px; border-top-right-radius:8px;">
        <h1 style="color:#ffffff; margin:0; font-size:28px;">Welcome to Retube!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:30px 40px;">
        <p style="font-size:16px; color:#333;">Hi ${name},</p>

        <p style="font-size:16px; color:#333;">
          🎉 You're now registered as a <strong>Secondary User</strong> on <strong>Retube</strong>.
        </p>

        <p style="font-size:16px; color:#333;">
          You've been successfully linked with the Primary User: <strong>${primaryName}</strong>.
        </p>

        <hr style="margin:30px 0; border:none; border-top:1px solid #ddd;"/>

        <h3 style="color:#0F7173;">Your Role on Retube:</h3>
        <ol style="padding-left:20px; color:#333; font-size:15px;">
          <li>The Primary User will upload videos to Retube.</li>
          <li>You will <strong>download and edit</strong> those videos.</li>
          <li>Once edited, upload them back to Retube.</li>
          <li>The Primary User will approve the videos, and they will be posted to their YouTube channel.</li>
        </ol>

        <p style="font-size:16px; color:#333; margin-top:30px;">
          Thank you for being part of the Retube ecosystem and helping content creators streamline their workflow!
        </p>

        <p style="font-size:16px; color:#0F7173; font-weight:bold;">– Retube </p>
      </td>
    </tr>
    <tr>
      <td style="background-color:#f0f0f0; text-align:center; padding:15px; font-size:12px; color:#777;">
        © 2025 Retube. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>

  `
}

export {
  generateVerificationEmailHTML,
  generateInviteCodeEmailHTML,
  primaryuserSuccessEmail,
  secondarySuccessEmail
};