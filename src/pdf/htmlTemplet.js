const generateinviteCodeHTML = (emailPrimary, name, inviteCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Retube Invitation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f6f6;
      margin: 0;
      padding: 40px;
      width: 210mm;
      height: 297mm;
      box-sizing: border-box;
    }

    .container {
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
      padding: 40px;
      box-sizing: border-box;
    }

    .header {
      background-color: #0F7173;
      padding: 20px 40px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      text-align: center;
      color: #ffffff;
    }

    h1 {
      margin: 0;
      font-size: 28px;
    }

    p {
      font-size: 16px;
      color: #333333;
      line-height: 1.6;
    }

    .info-box {
      margin-top: 20px;
      background-color: #f0f0f0;
      padding: 15px 20px;
      border-radius: 6px;
    }

    .code {
      font-size: 18px;
      font-weight: bold;
      color: #0F7173;
      padding-left: 35px;
    }

    .email {
      padding-left: 18px;
    }

    .footer {
      margin-top: 50px;
      font-size: 12px;
      color: #777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're Invited to Retube</h1>
    </div>

    <p>Hi ${name},</p>

    <p>
      You have been invited to join <strong>Retube</strong> as a <strong>Secondary User</strong>.
    </p>

    <p>
      Please use the details below to register and link your account:
    </p>

    <div class="info-box">
      <p><strong>Primary User Email:</strong> <span class="email">${emailPrimary}</span></p>
      <p><strong>Your Invite Code:</strong> <span class="code">${inviteCode}</span></p>
    </div>

    <p style="font-size:14px; color:#777; margin-top:30px;">
      ⚠️ Please complete your registration within <strong>10 days</strong> of receiving this invitation.
      Otherwise, the invite may expire and the associated account could be subject to removal for security and policy compliance.
    </p>

    <p style="margin-top:40px;">
      If you have any questions, please contact the Primary User or <a href="mailto:aksrahul14@gmail.com" style="color:#0F7173; text-decoration:none;">the Retube Support Team</a>.
    </p>

    <p style="margin-top:30px;">Welcome aboard,</p>
    <p style="font-weight:bold; color:#0F7173;">– The Retube Team</p>

    <div class="footer">
      © 2025 Retube. All rights reserved.
    </div>
  </div>
</body>
</html>
`}

export {
  generateinviteCodeHTML
};