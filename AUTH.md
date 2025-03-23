# Authentication System Documentation

This document provides a detailed overview of the authentication system implemented in this SvelteKit application.

## Overview

The authentication system is built with security and user experience in mind, implementing industry-standard practices for user authentication and session management.

## Core Components

### 1. User Authentication Flow

#### Registration Process
1. User submits registration form with:
   - Email address
   - Password
   - Additional profile information
2. System validates input data
3. Password is hashed using Argon2
4. User record is created in database
5. Verification email is sent
6. User must verify email before accessing protected routes

#### Login Process
1. User submits credentials
2. System validates credentials against database
3. Upon successful validation:
   - JWT token is generated
   - Token is stored in HTTP-only cookie
   - User is redirected to dashboard

#### Password Recovery Flow
1. User requests password reset
2. System generates unique reset token
3. Reset link is sent via email
4. User clicks link and sets new password
5. Reset token is invalidated after use

### 2. Security Measures

#### Password Security
- Passwords are hashed using Argon2 (industry-standard hashing algorithm)
- Minimum password requirements enforced
- Password reset tokens are time-limited

#### Session Management
- JWT-based session handling
- Tokens stored in HTTP-only cookies
- Automatic token refresh mechanism
- Session timeout implementation

#### Email Verification
- Required for new accounts
- Time-limited verification tokens
- Secure verification endpoints

### 3. Role-Based Access Control (RBAC)

The system implements three user roles:
- **User**: Basic access to application features
- **Admin**: Administrative capabilities
- **Super Admin**: Full system access

## Technical Implementation

### Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  role          Role      @default(USER)
  verified      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  resetTokens   ResetToken[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id])
}

model ResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id])
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}
```

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/register`: User registration
- `POST /api/auth/login`: User login
- `POST /api/auth/logout`: User logout
- `POST /api/auth/forgot-password`: Password recovery request
- `POST /api/auth/reset-password`: Password reset
- `GET /api/auth/verify-email`: Email verification

#### Session Management
- `GET /api/auth/session`: Get current session
- `POST /api/auth/refresh-token`: Refresh JWT token

### Route Structure

The authentication system is organized into the following route structure:

```
src/
├── routes/
│   ├── api/
│   │   └── auth/
│   │       ├── register/
│   │       │   └── +server.js    # Handle user registration
│   │       ├── login/
│   │       │   └── +server.js    # Handle user login
│   │       ├── logout/
│   │       │   └── +server.js    # Handle user logout
│   │       ├── forgot-password/
│   │       │   └── +server.js    # Handle password recovery requests
│   │       ├── reset-password/
│   │       │   └── +server.js    # Handle password reset
│   │       ├── verify-email/
│   │       │   └── +server.js    # Handle email verification
│   │       ├── session/
│   │       │   └── +server.js    # Handle session management
│   │       └── refresh-token/
│   │           └── +server.js    # Handle token refresh
│   ├── login/
│   │   ├── +page.svelte         # Login page UI
│   │   └── +page.server.js      # Login page server logic
│   ├── register/
│   │   ├── +page.svelte         # Registration page UI
│   │   └── +page.server.js      # Registration page server logic
│   ├── verify-email/
│   │   ├── +page.svelte         # Email verification page UI
│   │   └── +page.server.js      # Email verification logic
│   ├── forgot-password/
│   │   ├── +page.svelte         # Forgot password page UI
│   │   └── +page.server.js      # Forgot password logic
│   ├── reset-password/
│   │   ├── +page.svelte         # Reset password page UI
│   │   └── +page.server.js      # Reset password logic
│   └── dashboard/
│       ├── +page.svelte         # Protected dashboard UI
│       └── +page.server.js      # Dashboard server logic
└── lib/
    ├── server/
    │   ├── auth.js             # Server-side authentication utilities
    │   ├── email.js            # Email service configuration
    │   └── prisma.js           # Database connection and queries
    ├── auth.js                 # Client-side authentication utilities
    └── index.js                # Main library exports
```

#### Route Protection Levels

1. **Public Routes**
   - `/login`
   - `/register`
   - `/forgot-password`
   - `/reset-password`
   - `/verify-email`

2. **Protected Routes**
   - `/dashboard/*`
   - All API endpoints except registration and login

3. **Role-Based Protected Routes**
   - `/dashboard/admin/*` (Admin only)
   - `/dashboard/super-admin/*` (Super Admin only)

#### Route Handlers

Each route follows SvelteKit's file-based routing convention:

1. **Page Routes** (`+page.svelte` and `+page.server.js`)
   - Handle UI rendering
   - Process form submissions
   - Manage client-side state
   - Handle navigation

2. **API Routes** (`+server.js`)
   - Process HTTP requests
   - Handle authentication logic
   - Manage database operations
   - Return JSON responses

3. **Layout Routes** (`+layout.svelte` and `+layout.server.js`)
   - Provide shared UI elements
   - Handle global authentication state
   - Manage navigation guards

#### Route Guards

The system implements route guards at multiple levels:

1. **Server-Side Guards** (`+page.server.js`)
   ```javascript
   export const load = async ({ locals }) => {
     const session = await locals.getSession();
     if (!session) {
       throw redirect(303, '/login');
     }
     return { user: session.user };
   };
   ```

2. **Client-Side Guards** (`+page.svelte`)
   ```javascript
   import { goto } from '$app/navigation';
   import { onMount } from 'svelte';
   
   onMount(async () => {
     const response = await fetch('/api/auth/session');
     if (!response.ok) {
       goto('/login');
     }
   });
   ```

3. **API Route Guards** (`+server.js`)
   ```javascript
   export async function POST({ request, locals }) {
     const session = await locals.getSession();
     if (!session) {
       throw error(401, 'Unauthorized');
     }
     // Handle request
   }
   ```

### Environment Variables

Required environment variables for authentication:
```