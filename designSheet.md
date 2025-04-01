# Design Sheet - Color Palette

This document outlines the color palette used in the project. Please adhere to these colors to maintain consistency across the application.

## Core Colors

These colors are defined in `tailwind.config.ts`:

*   `dark_blue`: `#081e25` - Primary background color. Used for the main layout background and some modal backgrounds.
*   `light_blue`: `#8ab0e0` - Secondary color. Used for headings, labels, and links.
*   `light_blue-500`: `#7dd5de` - Accent color. Used extensively for buttons, interactive elements, and highlights. Opacity variations include `/10`, `/20`, and `/80`.
*   `modal_bg`: `#212c30` - Modal background color.

## Text Colors

*   `#333333`: Used in email templates (`src/lib/emailtemplets/cvReminderTemplate.tsx`) for primary text.
*   `#666666`: Used in email templates for secondary text and disclaimers.
*   `white`: Used for text on dark backgrounds and in specific UI elements.

## Usage

*   **Buttons:** Use `light_blue-500` for the background color and `dark_blue` for the text color.
*   **Links:** Use `light_blue-500` for the text color, with a hover effect to `light_blue`.
*   **Modals:** Use `modal_bg` for the background color.
*   **Headings:** Use `light_blue` for the text color.
*   **Backgrounds:** Use `dark_blue` for the main layout background.

## Email Templates

*   `#333333`: Primary text color
*   `#666666`: Secondary text color
*   `#f4f4f4`: Background color
*   `#2c5282`: Header and button background color
*   `#ffffff`: Content background and button text color