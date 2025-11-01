## Why
The current manager UI lacks a proper header structure, reducing usability and user experience for managers. The existing `/manager` page has no clear branding, manager identification, or logout functionality, making it difficult for managers to navigate and maintain session security.

## What Changes
- **ADDED** manager UI header with company logo, manager name, and logout button
- **ADDED** improved UI consistency and branding across manager interface
- **ADDED** secure logout functionality to end manager sessions

## Impact
- Affected specs: manager-ui (new capability for header component)
- Affected code: app/manager/page.tsx (manager dashboard page)
- User experience: Enhanced manager usability and session management
- Security: Proper logout functionality to prevent unauthorized access
