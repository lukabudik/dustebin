# Dustebin

<div align="center">
  <h3>A modern, secure code and image sharing platform</h3>
  <p>Share code snippets and images with syntax highlighting, privacy options, and self-destructing content</p>
  
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
- **🤖 AI-Generated Metadata**: Automatic title and description generation using Google's Gemini API
- **🔄 Real-time Updates**: Server-Sent Events (SSE) for live metadata generation status
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🌙 Dark Mode**: Automatic theme based on system preferences
- **🔄 No Registration**: Create and share pastes without an account
- **📷 Image Support**: Upload and share images with automatic compression
- **🔍 EXIF Data Extraction**: View camera, photo, and location metadata from images
- **🔄 Format Conversion**: Convert images between formats (JPEG, PNG, WebP, etc.)

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
- **AI**: Google's Gemini API for generating titles and descriptions
- **Real-time Updates**: Server-Sent Events (SSE) for live status updates
- **Image Processing**: Sharp for image compression and format conversion
- **EXIF Extraction**: exif-reader for extracting image metadata
- **Storage**: Cloudflare R2 (S3-compatible) for image storage

## 🤖 AI-Generated Metadata

Dustebin uses Google's Gemini API to automatically generate titles and descriptions for pastes:

- **Asynchronous Processing**: Metadata is generated in the background after paste creation
- **Real-time Updates**: Status updates are delivered via Server-Sent Events (SSE)
- **Language-Aware**: Generates context-appropriate titles and descriptions based on the code language
- **Fallback Handling**: Graceful degradation if the AI service is unavailable

### Server-Sent Events (SSE)

The application uses SSE to provide real-time updates on metadata generation:

- **Live Status Updates**: Clients receive updates as metadata generation progresses
- **Efficient Communication**: One-way server-to-client communication without polling
- **Graceful Timeouts**: Automatic connection management with appropriate timeouts
- **Error Handling**: Robust error handling for failed connections or generation issues

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
# Edit .env with your database credentials and API keys
```

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `CLEANUP_API_KEY`: API key for the admin cleanup endpoint
- `GEMINI_API_KEY`: Google Gemini API key for AI-generated titles and descriptions
- `R2_ACCOUNT_ID`: Cloudflare account ID for R2 storage
- `R2_ACCESS_KEY_ID`: Access key ID for R2 storage
- `R2_SECRET_ACCESS_KEY`: Secret access key for R2 storage
- `R2_BUCKET_NAME`: Bucket name for R2 storage
- `R2_PUBLIC_URL`: Public URL for R2 storage

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

## 📷 Image Support

Dustebin allows users to share images with the same privacy and expiration features as text pastes:

- **Image Upload**: Upload images up to 10MB in size
- **Format Support**: JPEG, PNG, WebP, GIF, HEIC, AVIF, TIFF, and BMP
- **Automatic Compression**: Images are automatically compressed to reduce size while maintaining quality
- **Format Conversion**: Convert images between formats for download
- **EXIF Data Extraction**: View camera information, photo details, and location data from images
- **Privacy Protection**: EXIF data is only visible to those with access to the paste

### EXIF Data Viewer

The EXIF data viewer provides detailed information about images:

- **Camera Information**: Make, model, software, and dimensions
- **Photo Details**: Date taken, exposure time, aperture, ISO, and focal length
- **Location Data**: GPS coordinates with Google Maps integration (if available)
- **Privacy Controls**: EXIF data is only shown when explicitly requested

### Image Processing

Images are processed to ensure optimal performance and quality:

- **Automatic Resizing**: Large images are resized to a maximum of 2000x2000 pixels
- **Quality Optimization**: Images are compressed with optimal quality settings
- **Format Preservation**: Original format is preserved while offering conversion options
- **Efficient Storage**: Images are stored in Cloudflare R2 with appropriate caching headers

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

  - Body: `{ content, language, expiration, password?, image?, pasteType?, originalFormat? }`
  - Returns: `{ id, language, createdAt, expiresAt, hasPassword, hasImage?, imageUrl?, pasteType? }`

- `GET /api/pastes/[id]` - Get a paste by ID

  - Headers: `X-Password` (optional)
  - Query: `password` (optional)
  - Returns: Paste object with content or image URL

- `GET /api/pastes/[id]/raw` - Get raw paste content

  - Query: `password` (optional), `confirm` (for burn-after-read)
  - Returns: Plain text content

- `POST /api/pastes/[id]/burn` - Burn a paste after reading

  - Returns: `{ success: true, message: 'Paste has been burned' }`

- `GET /api/pastes/[id]/metadata` - Get real-time metadata generation status via SSE
  - Returns: Server-Sent Events with status updates (`pending`, `completed`, `failed`, etc.)
  - When completed, includes generated title and description

### Images

- `GET /api/pastes/[id]/image` - Get the image for a paste

  - Query: `password` (optional)
  - Returns: Image file

- `GET /api/pastes/[id]/download` - Download an image in a specific format

  - Query: `format` (original, jpg, png, webp), `password` (optional)
  - Returns: Image file in the requested format

- `GET /api/pastes/[id]/formats` - Get available image formats and sizes
  - Returns: `{ formats: [{ id, name, size, extension }] }`

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
