const generateEmailHTML = (name, verifyCode) => {
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
        <h2 style="color: #333; font-size: 18px;">Hi ${name}</h2>
        <h2 style="color: #333; font-size: 18px;">Your Verification Code</h2>
        <p style="font-size: 16px; color: #555;">Use the code below to verify your email address.</p>
        <div style="font-size: 24px; font-weight: bold; color: #0F7173; margin: 15px 0;">${verifyCode}</div>
        <p style="font-size: 14px; color: #777;">If you didn’t request this, you can ignore this email.</p>
    </div>
</body>
</html>
  `;
};

export {generateEmailHTML};