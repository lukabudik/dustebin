# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Dustebin seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly**
2. **Email the details to** [INSERT CONTACT EMAIL]
3. **Include the following information**:
   - Type of vulnerability
   - Full path of source file(s) related to the issue
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the vulnerability

## What to Expect

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a more detailed response within 7 days, indicating the next steps in handling your report
- We will keep you informed of our progress towards resolving the issue
- After the issue is resolved, we will publicly acknowledge your responsible disclosure (unless you prefer to remain anonymous)

## Security Best Practices for Deployment

When deploying Dustebin, please follow these security best practices:

1. **Environment Variables**:

   - Use strong, randomly generated values for `CLEANUP_API_KEY`
   - Never commit `.env` files to version control
   - Use a secure method to manage environment variables in production

2. **Database Security**:

   - Use a strong password for your PostgreSQL database
   - Restrict network access to your database
   - Enable SSL for database connections in production

3. **API Protection**:

   - Set up rate limiting at the infrastructure level
   - Consider using a Web Application Firewall (WAF) in production

4. **Regular Updates**:
   - Keep all dependencies updated
   - Subscribe to security announcements for key dependencies

## Security Features

Dustebin includes several security features:

- **Password Protection**: Passwords are hashed using bcrypt with appropriate salt rounds
- **Burn After Reading**: Self-destructing pastes that are deleted after viewing
- **Rate Limiting**: Prevents abuse by limiting requests per IP address
- **No Persistent User Data**: Minimizes data exposure by not requiring user accounts
- **Automatic Expiration**: Pastes can be set to expire automatically, reducing data retention
