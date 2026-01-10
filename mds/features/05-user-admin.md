# Feature 05: User Management (Admin Panel)

## Overview

Administrative tools for managing users and system roles.

## Tasks

- [ ] **Users Tab**: Add "Users" tab to manager dashboard (Admin only).
- [ ] **User CRUD**: Implement queries/mutations for listing, editing, blocking, and deleting users.
- [x] **Invitations**: Implement "Create Manager" flow with temporary password generation.
- [x] **RBAC**: Enforce server-side checks for `admin` vs `manager` roles in actions/mutations.

## Invitation Flow

1. Admin enters Phone, Name, Email.
2. System generates random 6-digit code.
3. Code is displayed once to admin for manual sharing.
4. User logs in with phone + code → Forced to change password.
