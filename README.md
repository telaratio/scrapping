# SvelteKit Authentication Template

A clean and secure authentication template for SvelteKit applications with user management and session handling.

## Features

- 🔐 JWT-based authentication
- 👥 User management with roles (User, Admin, Super Admin)
- 📧 Email verification
- 🔒 Secure session management
- 🛡️ Role-based access control

## Getting Started

1. Clone this repository:
```bash
git clone https://github.com/telaratio/authsetup.git
cd sveltekit-auth-template
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Update the database connection string
   - Set your JWT secret
   - (Optional) Configure email settings

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/your_database_name?schema=public"

# JWT secret for authentication
JWT_SECRET="your-jwt-secret-key"

# Email configuration (optional)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"
```

## Database Schema

The template includes a streamlined database schema focused on authentication:
- User management with roles
- Session tracking
- Email verification

## Building for Production

```bash
npm run build
```

## License

MIT
