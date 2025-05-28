# Email Templates Usage

The `SendEmail` function now uses a general email template for all emails, providing a professional and consistent layout.

## Usage

The function always uses the general template. You must provide `templateData` with the required fields:

```typescript
await SendEmail({
    user_id: "user123",
    company_id: "company456",
    to: "user@example.com",
    subject: "Custom Notification",
    templateData: {
        title: "Custom Email Title",
        heading: "Important Notification",
        content: `
            <p>Hello there!</p>
            <p>This is a custom email with rich content.</p>
            <ul>
                <li>Point 1</li>
                <li>Point 2</li>
            </ul>
        `,
        buttonText: "Take Action", // Optional
        buttonLink: "https://example.com/action", // Optional
        companyName: "Your Company", // Optional (defaults to "DigiGrowing")
        footerText: "Custom footer text here" // Optional
    }
});
```

## Template Data Properties

### Required:
- `title`: Email title (appears in browser tab)
- `heading`: Main heading in the email
- `content`: Main content (can include HTML)

### Optional:
- `buttonText`: Text for the call-to-action button
- `buttonLink`: URL for the call-to-action button
- `companyName`: Company name (defaults to "DigiGrowing")
- `footerText`: Additional footer text

## Example Use Cases

### Project Notification
```typescript
await SendEmail({
    user_id: "user123",
    company_id: "company456",
    to: "team@example.com",
    subject: "Project Update",
    templateData: {
        title: "Project Update",
        heading: "Weekly Progress Report",
        content: "<p>Here's your weekly project update with all the latest developments...</p>",
        buttonText: "View Project",
        buttonLink: "https://example.com/project/123",
        companyName: "Your Company"
    }
});
```

### Task Assignment
```typescript
await SendEmail({
    user_id: "user123",
    company_id: "company456",
    to: "developer@example.com",
    subject: "New Task Assigned",
    templateData: {
        title: "New Task Assignment",
        heading: "You have been assigned a new task",
        content: `
            <p><strong>Task:</strong> Implement user authentication</p>
            <p><strong>Deadline:</strong> Friday, 5 PM</p>
            <p><strong>Priority:</strong> High</p>
        `,
        buttonText: "View Task",
        buttonLink: "https://example.com/tasks/456"
    }
});
```

### Simple Notification
```typescript
await SendEmail({
    user_id: "user123",
    company_id: "company456",
    to: "user@example.com",
    subject: "Account Verification",
    templateData: {
        title: "Account Verification",
        heading: "Welcome to our platform!",
        content: "<p>Thank you for signing up. Your account has been successfully created.</p>"
    }
});
```