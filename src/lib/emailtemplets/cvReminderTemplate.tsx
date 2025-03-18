export function CVUploadReminderTemplate(link: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>CV Upload Reminder - DigiGrowing</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto;">
                    <tr>
                        <td align="center" style="padding: 20px 0;">
                            <div style="font-size: 24px; font-weight: bold; color: #2c5282;">DigiGrowing</div>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                            <h2 style="margin-top: 0; color: #2c5282;">CV Upload Reminder</h2>
                            <p>Hello,</p>
                            <p>This is a friendly reminder to upload your CV. Please use the button below to upload your CV:</p>
                            
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; width: 100%;">
                                <tr>
                                    <td align="center">
                                        <a href="${link}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #2c5282; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Upload CV</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #666666;">If you're having trouble clicking the button, copy and paste the following link into your browser:</p>
                            <p style="word-break: break-all; font-size: 12px; color: #666666;">${link}</p>
                            <p style="margin-bottom: 0;">Best regards,<br>The DigiGrowing Team</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <p style="margin: 5px 0; color: #666666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
                            <p style="margin: 5px 0; color: #666666; font-size: 12px;">&copy; 2025 DigiGrowing. All rights reserved.</p>
                            <p style="margin: 5px 0; color: #666666; font-size: 12px;">123 Digital Street, Tech City, TC 12345</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}