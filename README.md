# Dustebin

<div align="center">
  <h3>A modern, secure code sharing platform</h3>
  <p>Share code snippets with syntax highlighting, privacy options, and self-destructing pastes</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
</div>

## 🚀 Features

- **🔒 Privacy-Focused**: Password protection and burn-after-reading options
- **🔍 Syntax Highlighting**: Automatic language detection for multiple programming languages
- **⏱️ Expiration Control**: Set pastes to expire after 1 hour, 1 day, 7 days, or 30 days
- **🗜️ Content Compression**: Efficient storage with Brotli compression
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🌙 Dark Mode**: Automatic theme based on system preferences
- **🔄 No Registration**: Create and share pastes without an account

## 🔗 Live Service

[Try Dustebin now](https://dustebin.com)

## 📖 Documentation

- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to the project
- [Development Guide](DEVELOPMENT.md) - Development workflow and coding standards
- [Code of Conduct](CODE_OF_CONDUCT.md) - Guidelines for community participation
- [Security Policy](SECURITY.md) - Security practices and vulnerability reporting
- [Changelog](CHANGELOG.md) - Record of all notable changes
- [License](LICENSE) - MIT License

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Code Editor**: CodeMirror for syntax highlighting and editing
- **Validation**: Zod for robust schema validation
- **Compression**: Brotli algorithm for efficient content storage
- **Authentication**: Password hashing with bcrypt for protected pastes

## 🏁 Getting Started

### Prerequisites

- Node.js 20+ (see [.nvmrc](.nvmrc))
- pnpm (or npm/yarn)
- PostgreSQL database

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/lukabudik/dustebin.git
cd dustebin
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your database credentials and API key
```

4. **Set up the database**

```bash
# Run the SQL script to create the database
psql -U username -f prisma/init.sql

# Apply migrations
npx prisma migrate dev
```

5. **Start the development server**

```bash
pnpm dev
```

6. **Open [http://localhost:3000](http://localhost:3000) in your browser**

### Docker Setup

For development with Docker:

```bash
# Start the development environment
docker-compose up
```

For production with Docker:

```bash
# Build the Docker image
docker build -t dustebin .

# Run the container
docker run -p 3000:3000 --env-file .env dustebin
```

### Production Deployment

For production deployment:

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

Make sure to set up the environment variables in your production environment.

## 🔄 Scheduled Cleanup

Dustebin automatically removes expired pastes through multiple mechanisms:

### Passive Cleanup

When a paste is accessed and found to be expired, it is automatically deleted.

### Scheduled Cleanup (Recommended for Production)

For production environments, set up a scheduled job to call the cleanup endpoint:

```bash
# Example cron job (runs every hour)
0 * * * * curl -X POST https://dustebin.com/api/admin/cleanup -H "Authorization: Bearer YOUR_API_KEY"
```

You can configure the API key by setting the `CLEANUP_API_KEY` environment variable.

#### Using GitHub Actions

A GitHub Actions workflow is included to automatically run the cleanup process:

1. Add your deployment URL as a GitHub secret named `DUSTEBIN_URL`
2. Add your API key as a GitHub secret named `CLEANUP_API_KEY`
3. Enable GitHub Actions in your repository

## 🔒 Security Features

### Password Protection

Pastes can be protected with passwords. The passwords are:

- Never stored in plain text
- Hashed using bcrypt with appropriate salt rounds
- Verified server-side before content is delivered

### Burn After Reading

The "Burn After Reading" feature:

- Creates pastes that are deleted from the database after being viewed once
- Requires explicit confirmation before viewing to prevent accidental deletion
- Provides a warning to users that the content will be permanently deleted

### Rate Limiting

The application includes rate limiting to prevent abuse:

- Maximum of 60 requests per minute per IP address
- Maximum of 20 paste creations per hour per IP address

## 🏗️ Project Structure

```
dustebin/
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── [id]/          # Paste view page
│   │   └── ...            # Other pages
│   ├── components/        # React components
│   └── lib/               # Utility functions and services
├── .github/               # GitHub configuration
└── ...                    # Configuration files
```

## 📡 API Reference

### Pastes

- `POST /api/pastes` - Create a new paste

  - Body: `{ content, language, expiration, password? }`
  - Returns: `{ id, language, createdAt, expiresAt, hasPassword }`

- `GET /api/pastes/[id]` - Get a paste by ID

  - Headers: `X-Password` (optional)
  - Query: `password` (optional)
  - Returns: Paste object with content

- `GET /api/pastes/[id]/raw` - Get raw paste content

  - Query: `password` (optional), `confirm` (for burn-after-read)
  - Returns: Plain text content

- `POST /api/pastes/[id]/burn` - Burn a paste after reading
  - Returns: `{ success: true, message: 'Paste has been burned' }`

### Languages

- `GET /api/languages` - Get supported languages
  - Returns: `{ languages: [{ value, label }] }`

### Admin

- `POST /api/admin/cleanup` - Clean up expired pastes (admin only)
  - Headers: `Authorization: Bearer YOUR_API_KEY`
  - Returns: `{ success: true, deleted: count, timestamp }`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started, coding standards, and more.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
