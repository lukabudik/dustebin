# Dustebin

A modern, secure code sharing platform built with Next.js, PostgreSQL, and TypeScript. Dustebin allows users to easily share code snippets with syntax highlighting, privacy options, and expiration settings.

## Features

- **Code Sharing**: Share code snippets with automatic language detection and syntax highlighting
- **Privacy Options**: Create public pastes or protect them with passwords
- **Burn After Reading**: Create self-destructing pastes that are deleted after being viewed once
- **Expiration Settings**: Set pastes to expire after 1 hour, 1 day, 7 days, or 30 days
- **Content Compression**: Automatic Brotli compression for efficient storage of large pastes
- **Raw View**: Access the raw content of pastes for easy copying or downloading
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices
- **Dark Mode**: Automatic dark mode based on system preferences
- **No Registration Required**: Create and share pastes without creating an account

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Code Editor**: CodeMirror for syntax highlighting and editing
- **Validation**: Zod for robust schema validation
- **Compression**: Brotli algorithm for efficient content storage
- **Authentication**: Password hashing with bcrypt for protected pastes

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/dustebin.git
cd dustebin
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up your environment variables:

Create a `.env` file in the root directory with the following content:

```
DATABASE_URL="postgresql://username:password@localhost:5432/dustebin?schema=public"
CLEANUP_API_KEY="your-secure-api-key-for-admin-routes"
```

Replace `username` and `password` with your PostgreSQL credentials, and set a secure random string for `CLEANUP_API_KEY`.

4. Set up the database:

```bash
# Run the SQL script to create the database and tables
psql -U username -f prisma/init.sql

# Apply migrations and generate Prisma client
npx prisma migrate dev
```

5. Run the development server:

```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Deployment

For production deployment, we recommend using a platform like Vercel or Netlify:

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

Make sure to set up the environment variables in your production environment.

## Project Structure

```
dustebin/
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Prisma schema definition
│   ├── migrations/        # Database migrations
│   ├── init.sql           # Initial database setup
│   └── migrate.sql        # Migration helper script
├── public/                # Static assets
└── src/
    ├── app/               # Next.js App Router
    │   ├── api/           # API routes
    │   │   ├── admin/     # Admin routes (cleanup)
    │   │   ├── languages/ # Language support API
    │   │   └── pastes/    # Paste CRUD operations
    │   ├── [id]/          # Paste view page
    │   ├── about/         # About page
    │   ├── privacy/       # Privacy policy page
    │   ├── terms/         # Terms of service page
    │   ├── layout.tsx     # Root layout
    │   └── page.tsx       # Home page
    ├── components/        # React components
    │   ├── editor/        # Code editor components
    │   ├── layout/        # Layout components (header, footer)
    │   ├── paste/         # Paste-related components
    │   └── ui/            # UI components (Shadcn)
    ├── lib/               # Utility functions and services
    │   ├── services/      # Business logic
    │   │   └── paste-service.ts # Paste operations
    │   ├── utils/         # Helper functions
    │   │   ├── compression.ts   # Brotli compression
    │   │   ├── code-formatter.ts # Code formatting
    │   │   ├── helpers.ts       # General helpers
    │   │   ├── language-detector.ts # Language detection
    │   │   └── password-utils.ts # Password hashing
    │   ├── constants.ts   # Application constants
    │   ├── db.ts          # Database client
    │   └── validations.ts # Zod validation schemas
    └── middleware.ts      # Next.js middleware (API protection)
```

## API Reference

### Pastes

- `POST /api/pastes` - Create a new paste
  - Body: `{ content, language, expiration, password? }`
  - Returns: `{ id, language, createdAt, expiresAt, hasPassword }`

- `GET /api/pastes/[id]` - Get a paste by ID
  - Headers: `X-Password` (optional)
  - Query: `password` (optional)
  - Returns: Paste object with content

- `DELETE /api/pastes/[id]` - Delete a paste by ID
  - Returns: `{ success: true }`

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

## Expiration Handling

Dustebin automatically removes expired pastes through multiple mechanisms:

### Passive Cleanup

When a paste is accessed and found to be expired, it is automatically deleted. This ensures that expired content is eventually removed even without active cleanup processes.

### Background Cleanup

The application includes a built-in background cleanup system that:

1. Opportunistically removes expired pastes during normal database operations
2. Runs with throttling to minimize performance impact
3. Works without any additional configuration

### Scheduled Cleanup (Recommended for Production)

For production environments, we recommend setting up a scheduled job to call the cleanup endpoint:

```bash
# Example cron job (runs every hour)
0 * * * * curl -X POST https://your-dustebin-instance.com/api/admin/cleanup -H "Authorization: Bearer YOUR_API_KEY"
```

You can configure the API key by setting the `CLEANUP_API_KEY` environment variable.

For different platforms:
- **Vercel**: Use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- **GitHub Actions**: Use scheduled workflows
- **Heroku**: Use the Heroku Scheduler add-on

### Database-level Scheduling (Advanced)

If your PostgreSQL instance supports pg_cron:

```sql
-- Run cleanup every hour
SELECT cron.schedule('0 * * * *', $$
  DELETE FROM pastes WHERE expires_at < NOW();
$$);
```

## Security Features

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

## Performance Optimizations

### Content Compression

Large pastes are automatically compressed using the Brotli algorithm:
- Reduces database storage requirements
- Improves loading times for large pastes
- Transparent to users (compression/decompression happens automatically)

### View Count Debouncing

To prevent duplicate view counts from page refreshes:
- Views are debounced with a 2-second window
- In-memory cache tracks recent views to minimize database updates

## Browser Support

Dustebin is compatible with all modern browsers:
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers on iOS and Android

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
