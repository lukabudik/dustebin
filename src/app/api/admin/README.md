# Admin API Routes

This directory contains administrative API routes that are protected by middleware.

## Security

These routes are protected by the `CLEANUP_API_KEY` environment variable. When this variable is set, requests to these routes must include an `Authorization` header with a bearer token matching the API key.

Example:
```
Authorization: Bearer your-api-key-here
```

If the `CLEANUP_API_KEY` is not set, the routes will be accessible without authentication (useful for development).

## Available Routes

### `POST /api/admin/cleanup`

Deletes all expired pastes from the database.

**Request:**
```http
POST /api/admin/cleanup
Authorization: Bearer your-api-key-here
```

**Response:**
```json
{
  "success": true,
  "deleted": 5,
  "timestamp": "2025-03-09T14:30:00.000Z"
}
```

## Usage in Production

For production environments, it's recommended to:

1. Set a strong, random `CLEANUP_API_KEY` environment variable
2. Set up a scheduled job (cron, Vercel Cron Jobs, etc.) to call the cleanup endpoint regularly
3. Include the API key in the Authorization header of the scheduled requests

Example cron job:
```bash
0 * * * * curl -X POST https://your-dustebin-instance.com/api/admin/cleanup -H "Authorization: Bearer YOUR_API_KEY"
```

## Implementation Details

The protection for these routes is implemented in the `src/middleware.ts` file, which intercepts requests to `/api/admin/*` paths and verifies the Authorization header.
