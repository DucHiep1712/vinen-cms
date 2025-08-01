# Username/Password Authentication Setup Guide

## Overview
The Productivity App now uses traditional username and password authentication instead of email OTP. This guide will help you set up the authentication system.

## Database Schema

Update your database schema to use username and password:

```sql
-- Update users table
ALTER TABLE users 
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS otp_token,
DROP COLUMN IF EXISTS otp_expires_at,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS created_at,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE NOT NULL,
ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

## Environment Variables

Your `.env` file only needs Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# TinyMCE API Key (if using rich text editor)
VITE_TINYMCE_API_KEY=your_tinymce_api_key
```

## Features

### User Registration
- **Username**: 3-20 characters, alphanumeric and underscore only
- **Password**: Minimum 6 characters, securely hashed with bcrypt
- **Password confirmation**: Must match password

### User Login
- **Login with**: Username
- **Password**: Securely verified against hash
- **Session**: Stored in localStorage

### Security Features
- **Password hashing**: bcrypt with 12 salt rounds
- **Input validation**: Client and server-side validation
- **Session management**: Secure session storage
- **Protected routes**: Redirect unauthenticated users

## Testing

1. Start the development server: `npm run dev`
2. Navigate to the login page
3. Click "Đăng ký" to create a new account
4. Fill in username, email, and password
5. Click "Đăng ký" to create account
6. Switch to login mode
7. Enter username/email and password
8. Click "Đăng nhập" to access the app

## User Management

### Create Test User
You can programmatically create users using the `addUser` function:

```typescript
import { addUser } from '../services/authApi';

// Create a test user
await addUser('admin', 'password123');
```

### User Session
User sessions are stored in localStorage with this structure:
```json
{
  "userId": "uuid",
  "username": "username",
  "loggedInAt": "2024-01-01T00:00:00.000Z"
}
```

## Security Best Practices

- **Password strength**: Enforce minimum 6 characters
- **Username format**: Alphanumeric and underscore only
- **Email validation**: Proper email format validation
- **Session security**: Store minimal data in localStorage
- **Input sanitization**: Validate all user inputs
- **Error messages**: Generic error messages for security

## Troubleshooting

### Login Issues
- Check username format
- Verify password is correct
- Ensure user exists in database
- Check browser console for errors

### Registration Issues
- Username must be 3-20 characters
- Username can only contain letters, numbers, and underscores
- Password must be at least 6 characters
- Username must be unique

### Database Issues
- Ensure users table has correct schema
- Check Supabase connection
- Verify RLS policies allow user operations 