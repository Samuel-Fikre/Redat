# Redat Frontend

## Environment Setup

1. Create a `.env.local` file in the root directory for local development:
```env
# For local development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

2. For production deployment:
```env
# Production environment (already deployed)
NEXT_PUBLIC_API_BASE_URL=
```

Note: The production URL is already configured in the deployment platform. You only need to set up the local environment for development.

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).
