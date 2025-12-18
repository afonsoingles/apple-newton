# Apple Newton

A platform for building and distributing iOS apps to TestFlight using Expo and EAS Cloud.

## Overview

Apple Newton automates the process of building Expo apps and distributing them via TestFlight. It supports three build types:

### Build Types

1. **Development Builds** 🚀
   - Expo development builds for testing with an Expo server
   - Bundle ID gets `.dev-build` suffix (e.g., `dev.afonso.cat` → `dev.afonso.cat.dev-build`)
   - No verification required
   - Instant building

2. **Production Builds** 📦
   - Production-ready builds using default EAS configuration
   - Requires admin review for security and quality assurance
   - Published to TestFlight after Apple's review

3. **Custom Builds** ⚙️
   - Fully customizable EAS configuration (eas.json)
   - Requires admin review for security
   - Flexible build options for specific needs

## Features

- **HCA OAuth Integration**: Secure authentication using HCA OAuth provider
- **GitHub Integration**: Link repositories and automatically parse app.json
- **Encrypted Environment Variables**: Secure storage of secrets using AES-256-GCM encryption
- **Build Review System**: Admin workflow for reviewing production and custom builds
- **EAS Cloud/Local Builds**: Support for both cloud and local build execution
- **Fastlane Integration**: Automated App Store Connect uploads
- **TestFlight Automation**: Automatic publishing after Apple review
- **Slack Notifications**: Real-time updates via Slack DMs
- **Shared Certificates**: Managed distribution certificates for the developer account

## Architecture

```
┌─────────────┐
│   User      │
│   (HCA)     │
└──────┬──────┘
       │ Login
       ▼
┌─────────────────────────────────────┐
│  Apple Newton Platform              │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Web Dashboard               │  │
│  │  - App Management            │  │
│  │  - Build Configuration       │  │
│  │  - Review System             │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Build Worker                │  │
│  │  - EAS Build Execution       │  │
│  │  - Environment Decryption    │  │
│  │  - IPA Generation            │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  App Store Connect           │  │
│  │  - Fastlane Upload           │  │
│  │  - App Metadata              │  │
│  │  - Review Management         │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────┐
│   TestFlight    │
│   Distribution  │
└─────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: HCA OAuth, GitHub OAuth
- **Build System**: Expo EAS, Fastlane
- **Encryption**: Node.js crypto (AES-256-GCM)
- **Notifications**: Slack API

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Expo account and token
- Apple Developer account
- HCA OAuth credentials
- GitHub OAuth app
- Slack workspace and bot

### Installation

1. Clone the repository:
```bash
git clone https://github.com/afonsoingles/apple-newton.git
cd apple-newton
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database connection string
- OAuth credentials (HCA, GitHub)
- App Store Connect API keys
- Slack bot token
- Expo token
- Encryption key (generate with `openssl rand -hex 32`)

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Database Schema

The platform uses the following main models:

- **User**: User accounts with OAuth integration
- **App**: Linked GitHub repositories and app configurations
- **Build**: Build requests with status tracking
- **BuildReview**: Admin reviews for production/custom builds
- **Certificate**: Shared Apple developer certificates

See `prisma/schema.prisma` for the complete schema.

## API Routes

### Apps
- `GET /api/apps` - List user's apps
- `POST /api/apps` - Create new app from GitHub repo

### Builds
- `GET /api/builds` - List builds (optionally filtered by appId)
- `POST /api/builds` - Create new build

### Reviews
- `POST /api/builds/review` - Review a build (admin only)

## Build Flow

### Development Build
1. User creates build with type `development`
2. Bundle ID automatically gets `.dev-build` suffix
3. Build immediately queued for processing
4. Build worker:
   - Clones GitHub repository
   - Decrypts environment variables
   - Runs `eas build --platform ios --profile development`
   - Uploads IPA to App Store Connect
5. Notification sent to user via Slack

### Production/Custom Build
1. User creates build with type `production` or `custom`
2. Build status set to `awaiting_review`
3. Admin reviews the build configuration
4. If approved:
   - Build queued for processing
   - Same workflow as development build
   - After Apple review, published to TestFlight
5. If rejected:
   - User notified with rejection reason

## Security

### Environment Variables
- User environment variables are encrypted using AES-256-GCM
- Encryption key stored securely (not in database)
- Only build worker can decrypt using the key
- Each encrypted value has unique IV and auth tag

### Build Review
- Production and custom builds require admin approval
- Prevents malware and policy violations
- Reviewers can add notes and feedback

### Certificates
- Apple distribution certificates stored encrypted
- Shared across builds for the developer account
- Automatic rotation before expiry

## Development

### Code Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   ├── apps/       # App management
│   │   └── builds/     # Build management
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
├── lib/               # Utility functions
│   ├── appConfig.ts   # app.json parsing
│   ├── bundleId.ts    # Bundle ID utilities
│   ├── buildService.ts # Build workflow
│   ├── encryption.ts  # Encryption utilities
│   ├── github.ts      # GitHub API integration
│   └── prisma.ts      # Prisma client
└── types/             # TypeScript type definitions
    └── index.ts       # Core types
```

### Testing

Run linting:
```bash
npm run lint
```

### Adding Features

When adding new features:
1. Update the Prisma schema if needed
2. Run `npx prisma generate` to update the client
3. Add necessary API routes
4. Update TypeScript types
5. Add UI components as needed

## Roadmap

- [ ] Complete OAuth implementation (HCA, GitHub)
- [ ] Build worker service implementation
- [ ] Fastlane integration for App Store Connect
- [ ] TestFlight automation
- [ ] Slack notification system
- [ ] Certificate management system
- [ ] Admin dashboard for reviews
- [ ] Build logs viewer
- [ ] User dashboard for app/build management
- [ ] Webhook handlers for Apple review status
- [ ] Job queue system (Bull/BullMQ)
- [ ] Monitoring and alerting

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Support

For questions or issues, please open an issue on GitHub.
