# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick Start

This is an AI Website Builder built as a Turborepo monorepo with Next.js, AI integration, and database management.

**Note:** The full builder interface is currently in development. The landing page and architecture are complete, but the complete drag-and-drop builder is being finalized.

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Set up database (requires PostgreSQL)
cd packages/database
npm run generate
npm run db:push
cd ../..

# Start development servers
npm run dev
```

## Architecture Overview

This monorepo contains:

### Applications (`apps/`)
- **`apps/web`** - Main Next.js application (AI Website Builder interface)
  - Runs on port 3000
  - Contains the landing page, builder interface, and user dashboard
  - Uses drag-and-drop components, AI chat assistant, and real-time preview
  - Heavy integration with AI engine and database packages

- **`apps/docs`** - Documentation site (Next.js)
  - Runs on port 3001 
  - Contains project documentation and guides

### Packages (`packages/`)
- **`packages/ai-engine`** - Core AI functionality
  - OpenAI and Anthropic SDK integration
  - Code generation with validation and formatting
  - Supports React/Vue/Angular component generation
  - Exports: main engine, generators, prompts

- **`packages/database`** - Prisma ORM setup
  - PostgreSQL schema with comprehensive models
  - Handles users, projects, components, templates, deployments
  - Includes collaboration, versioning, and analytics models

- **`packages/ui`** - Shared React component library
  - Radix UI-based components with Tailwind CSS
  - Used across both apps for consistent design

- **`packages/eslint-config`** - Shared ESLint configuration
- **`packages/typescript-config`** - Shared TypeScript configurations

## Common Commands

### Development Workflow
```bash
# Start all apps in development mode
npm run dev

# Start specific app only
npx turbo dev --filter=web
npx turbo dev --filter=docs

# Build all packages and apps
npm run build

# Build specific app
npx turbo build --filter=web

# Run linting across all packages
npm run lint

# Format code
npm run format
```

### Database Operations
```bash
# Navigate to database package
cd packages/database

# Generate Prisma client
npm run generate

# Push schema changes to database
npm run db:push

# Run database migrations
npm run migrate

# Deploy migrations (for production)
npm run migrate:deploy

# Open Prisma Studio
npm run studio

# Reset database (destructive)
npm run reset

# Seed database with initial data
npm run seed
```

### Package-Specific Commands
```bash
# Work with the AI engine package
cd packages/ai-engine
npm run build          # Build with tsup
npm run dev            # Watch mode with tsup
npm run check-types    # TypeScript validation

# Work with the database package
cd packages/database
npm run generate       # Generate Prisma client
npm run studio         # Open Prisma Studio
npm run migrate        # Run migrations
```

### Testing and Quality
```bash
# Type checking across all packages
npm run check-types

# Run specific tests (if configured)
npx turbo test --filter=web
```

## Environment Setup

Required environment variables (from `.env.example`):

### Core Database
- `DATABASE_URL` - PostgreSQL connection string

### Authentication (NextAuth.js)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- OAuth: `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`

### AI Services
- `OPENAI_API_KEY` - For GPT-4 code generation
- `ANTHROPIC_API_KEY` - For Claude AI integration

### File Storage & Services  
- Cloudinary: `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`
- Resend: `RESEND_API_KEY`, `FROM_EMAIL`
- Stripe: `STRIPE_PUBLISHABLE_KEY/SECRET_KEY/WEBHOOK_SECRET`

### Deployment Platforms
- `VERCEL_TOKEN`, `NETLIFY_TOKEN`, `RAILWAY_TOKEN`

### Performance & Analytics
- `REDIS_URL`, `SENTRY_DSN`, `ANALYTICS_API_KEY`

## AI Engine Integration

The AI engine supports generating components, pages, and APIs:

```typescript
// Component generation example
const result = await aiEngine.generateComponent(
  "Create a responsive pricing card with three tiers",
  {
    framework: 'react',
    language: 'typescript', 
    styling: 'tailwind',
    responsive: true,
    accessible: true
  }
)
```

Key AI engine features:
- Multi-provider support (OpenAI, Anthropic)
- Code validation and formatting with Prettier
- Dependency extraction from imports
- Cost tracking and usage analytics

## Database Schema Highlights

Key models and relationships:
- **Users** → Projects → Pages → Components
- **Templates** with marketplace and review system
- **Assets** with Cloudinary integration
- **Deployments** supporting multiple platforms
- **Collaborations** with role-based permissions
- **GeneratedCode** tracking all AI outputs
- **Analytics** for usage monitoring

## Troubleshooting

### Database Issues
```bash
# Navigate to database package
cd packages/database

# If Prisma client is out of sync
npm run generate

# If schema changes aren't reflected
npm run db:push

# For migration conflicts
npm run reset  # WARNING: This will delete data
```

### Build Issues
```bash
# Clear Turbo cache
npx turbo clean

# Reinstall dependencies (Windows PowerShell)
rm -r -fo node_modules, apps/*/node_modules, packages/*/node_modules
npm install

# Reinstall dependencies (Linux/macOS)
# rm -rf node_modules apps/*/node_modules packages/*/node_modules
# npm install

# Check for type errors
npm run check-types
```

### AI Integration Issues
- Verify API keys are set in environment
- Check rate limiting settings in `.env`
- Monitor token usage and costs through the dashboard

### Development Server Issues
```bash
# Kill processes on ports 3000/3001
npx kill-port 3000 3001

# Start with verbose logging
npm run dev -- --verbose
```

## Package Dependencies

Key dependency flows:
- `apps/web` depends on: `@repo/ui`, `@repo/database`, `@repo/ai-engine`
- `packages/ai-engine` is independent (core functionality)
- `packages/database` exports Prisma client for apps
- `packages/ui` provides shared components with Radix/Tailwind

The web app heavily integrates with the AI engine for code generation and the database for persistence, making it the primary consumer of the monorepo's shared packages.