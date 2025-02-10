export function VerificationEmailTemplate(link: string) {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - DigiGrowing</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c5282;
        }
        .content {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2c5282;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">DigiGrowing</div>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hello,</p>
            <p>Thank you for signing up with DigiGrowing! To complete your registration and ensure the security of your account, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
                <a href="{${link}}" class="button">Verify Email Address</a>
            </div>
            <p>If you didn't create an account with DigiGrowing, you can safely ignore this email.</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you're having trouble clicking the button, copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; font-size: 12px;">${link}</p>
            <p>Best regards,<br>The DigiGrowing Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; 2025 DigiGrowing. All rights reserved.</p>
            <p>123 Digital Street, Tech City, TC 12345</p>
        </div>
    </div>
</body>
</html>`
}