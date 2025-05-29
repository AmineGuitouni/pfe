// Email Templates
export { CVUploadReminderTemplate } from './cvReminderTemplate';
export { AddUserToCompanyTemplate } from './addUserToCompanyTemplate';
export { ForgotPasswordTemplate } from './forget-password';
export { GeneralEmailTemplate } from './generalTemplate';

// Re-export other templates
export * from './changePassword';
export * from './emailChange';
export * from './verificationEmail';

// Template types
export const EMAIL_TEMPLATES = {
    CV_REMINDER: 'cv_reminder',
    ADD_USER_TO_COMPANY: 'add_user_to_company',
    FORGOT_PASSWORD: 'forgot_password',
    CHANGE_PASSWORD: 'change_password',
    EMAIL_CHANGE: 'email_change',
    VERIFICATION_EMAIL: 'verification_email',
    GENERAL: 'general'
} as const;

export type EmailTemplateType = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES];