# Deployment Guide

## Overview

This guide covers how to deploy and run the Apple Newton platform with all features enabled.

## Prerequisites

### Required Services

1. **PostgreSQL Database**
   - Version 12 or higher
   - Create database: `createdb apple_newton`

2. **Redis Server**
   - Version 6 or higher
   - Required for Bull queue
   - Default: localhost:6379

3. **Expo Account**
   - Sign up at https://expo.dev
   - Generate access token from account settings

4. **Apple Developer Account**
   - Paid developer membership required
   - App Store Connect API key
   - Team ID

5. **Slack Workspace**
   - Create Slack app at https://api.slack.com/apps
   - Install to workspace
   - Get bot token (xoxb-...)
   - Get admin channel ID

### OAuth Applications

#### GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: Apple Newton
   - Homepage URL: http://localhost:3000 (or your domain)
   - Authorization callback URL: http://localhost:3000/api/auth/callback/github
4. Get Client ID and Client Secret

#### HCA OAuth (Custom Provider)

1. Contact your HCA provider for OAuth credentials
2. Get authorization URL, token URL, and userinfo URL
3. Register callback URL: http://localhost:3000/api/auth/callback/hca

## Installation

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/afonsoingles/apple-newton.git
cd apple-newton
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/apple_newton"

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY="your-64-char-hex-key"
ENCRYPTION_SALT="your-64-char-hex-salt"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# HCA OAuth
HCA_CLIENT_ID="your-hca-client-id"
HCA_CLIENT_SECRET="your-hca-client-secret"
HCA_AUTHORIZATION_URL="https://hca.example.com/oauth/authorize"
HCA_TOKEN_URL="https://hca.example.com/oauth/token"
HCA_USERINFO_URL="https://hca.example.com/oauth/userinfo"

# Apple/App Store Connect
APPLE_ID="your-apple-id@example.com"
APPLE_PASSWORD="your-app-specific-password"
APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"
APPLE_TEAM_ID="YOUR_TEAM_ID"
APP_STORE_CONNECT_KEY_ID="YOUR_KEY_ID"
APP_STORE_CONNECT_ISSUER_ID="YOUR_ISSUER_ID"
APP_STORE_CONNECT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Slack
SLACK_BOT_TOKEN="xoxb-your-bot-token"
SLACK_SIGNING_SECRET="your-signing-secret"
SLACK_ADMIN_CHANNEL_ID="C1234567890"

# Expo
EXPO_TOKEN="your-expo-access-token"
EAS_LOCAL_BUILD="false"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations
npx prisma migrate dev
```

### 4. Install Fastlane (Optional for local development)

```bash
# macOS
brew install fastlane

# Or with Ruby
gem install fastlane
```

## Running the Application

### Development Mode

You need **two terminal windows**:

**Terminal 1 - Next.js App:**
```bash
npm run dev
```

**Terminal 2 - Build Worker:**
```bash
node scripts/worker.js
```

The app will be available at http://localhost:3000

### Production Mode

**Build the application:**
```bash
npm run build
```

**Start the server:**
```bash
npm start
```

**Start the worker (separate process):**
```bash
NODE_ENV=production node scripts/worker.js
```

## Using the Platform

### 1. Sign In

1. Navigate to http://localhost:3000
2. Click "Get Started"
3. Choose GitHub or HCA OAuth
4. Authorize the application

### 2. Create an App

1. After signing in, you'll be at `/dashboard`
2. Click "New App"
3. Enter GitHub owner and repo name
4. The platform will fetch `app.json` automatically
5. App is created with bundle ID and metadata

### 3. Create a Build

**Development Build:**
1. Click "New Build" on an app
2. Select "Development" type
3. Add environment variables (optional)
4. Click "Create Build"
5. Build starts immediately (no review needed)
6. Bundle ID gets `.dev-build` suffix

**Production Build:**
1. Click "New Build"
2. Select "Production" type
3. Add environment variables
4. Add Apple review data (demo credentials, instructions)
5. Click "Create Build"
6. Build goes to "Awaiting Review"
7. Admin must approve before building

**Custom Build:**
1. Select "Custom" type
2. Provide custom `eas.json` configuration
3. Add environment variables
4. Submit for review
5. Admin must approve

### 4. Admin Review (Admin Only)

1. Sign in as admin user
2. Navigate to `/admin`
3. See pending reviews
4. Click "Review Build"
5. Approve or reject with notes
6. Approved builds start building automatically

### 5. Monitor Builds

**User Dashboard:**
- View all your apps
- See recent builds
- Check build status
- View build logs (when available)

**Slack Notifications:**
- Build started
- Build completed
- Build failed
- TestFlight published

## Build Worker Details

### How It Works

1. **Queue Job**: When a build is created, it's added to Bull queue
2. **Worker Picks Up**: Worker process retrieves job from Redis
3. **Clone Repo**: Clones GitHub repository
4. **Setup Environment**: Creates `.env` file with decrypted variables
5. **Run EAS Build**: Executes `eas build` command
6. **Upload IPA**: Uses Fastlane to upload to App Store Connect
7. **Update Status**: Updates database and sends Slack notification

### Worker Monitoring

Check worker logs:
```bash
# Worker logs show:
- Job processing
- Build progress
- Upload status
- Errors and failures
```

### Retry Logic

- Failed builds retry 3 times
- Exponential backoff: 1 minute, 2 minutes, 4 minutes
- After 3 failures, build marked as failed

## Slack Integration

### Setting Up Slack Bot

1. **Create Slack App**:
   - Go to https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Name: Apple Newton
   - Choose workspace

2. **Add Scopes**:
   - OAuth & Permissions → Bot Token Scopes
   - Add: `chat:write`, `chat:write.public`, `users:read`

3. **Install to Workspace**:
   - Install App → Install to Workspace
   - Copy Bot User OAuth Token (starts with xoxb-)

4. **Get Channel ID**:
   - Open Slack → Right-click channel → View channel details
   - Copy Channel ID from bottom

### Notification Types

**Build Status:**
```
🚀 Build Started
App: My App
Build Type: Production
Status: Building...
```

**Build Complete:**
```
✅ Build Completed
App: My App
Build completed and uploaded to TestFlight
```

**Build Failed:**
```
❌ Build Failed
App: My App
Build failed: Error message
```

**Review Required:**
```
🔔 Build Review Required
App: My App
Build Type: Production
Submitted by: John Doe
[Review Build Button]
```

## Fastlane Configuration

### App Store Connect API Key

1. Go to App Store Connect → Users and Access → Keys
2. Click + to create a new key
3. Name: Apple Newton
4. Access: Admin or Developer
5. Download key file (.p8)
6. Get Issuer ID and Key ID
7. Add to environment variables

### TestFlight Distribution

Fastlane automatically:
- Uploads IPA to TestFlight
- Submits for Apple review
- Adds demo credentials
- Sets review notes

## Troubleshooting

### Build Worker Not Processing Jobs

```bash
# Check Redis connection
redis-cli ping
# Should return: PONG

# Check worker logs
node scripts/worker.js
# Look for: "Build worker started and listening for jobs"
```

### OAuth Not Working

```bash
# Check callback URLs match exactly
# GitHub: http://localhost:3000/api/auth/callback/github
# HCA: http://localhost:3000/api/auth/callback/hca

# Check environment variables
echo $GITHUB_CLIENT_ID
echo $NEXTAUTH_URL
```

### EAS Build Fails

```bash
# Check Expo token
npx expo whoami

# Check EAS CLI
npx eas-cli --version

# Test build manually
cd /tmp/test-repo
npx eas build --platform ios --profile production
```

### Fastlane Upload Fails

```bash
# Check credentials
fastlane run validate_app_store_connect_api_key \
  key_id:YOUR_KEY_ID \
  issuer_id:YOUR_ISSUER_ID \
  key_content:"$(cat AuthKey_XXX.p8)"

# Test upload manually
fastlane deliver --ipa path/to/app.ipa
```

## Production Deployment

### Recommended Setup

1. **Server Requirements**:
   - 2+ CPU cores
   - 4GB+ RAM
   - 20GB+ disk space
   - Ubuntu 20.04 or later

2. **Process Management**:
   ```bash
   # Use PM2 for process management
   npm install -g pm2
   
   # Start Next.js
   pm2 start npm --name "apple-newton-web" -- start
   
   # Start worker
   pm2 start scripts/worker.js --name "apple-newton-worker"
   
   # Save configuration
   pm2 save
   pm2 startup
   ```

3. **Reverse Proxy (Nginx)**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL Certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Environment Variables in Production

- Use secret management service (AWS Secrets Manager, HashiCorp Vault)
- Never commit `.env` to version control
- Rotate encryption keys regularly
- Use separate keys for dev/staging/production

### Monitoring

- Set up logging with Winston or Pino
- Monitor Redis with RedisInsight
- Track build metrics
- Set up alerts for failed builds

## Scaling

### Horizontal Scaling

1. **Multiple Workers**:
   ```bash
   # Start multiple worker processes
   pm2 start scripts/worker.js -i 3
   ```

2. **Load Balancing**:
   - Use Nginx or HAProxy for web servers
   - Redis handles worker coordination automatically

3. **Database**:
   - Use connection pooling
   - Consider read replicas for heavy load

### Vertical Scaling

- Increase worker CPU/RAM for parallel builds
- Use faster disk (SSD/NVMe) for cloning repos
- Optimize Redis with more memory

## Security Checklist

- [ ] Encryption key is 32+ characters
- [ ] Encryption salt is unique per deployment
- [ ] NextAuth secret is strong and unique
- [ ] OAuth callback URLs are HTTPS in production
- [ ] Database uses strong password
- [ ] Redis has password in production
- [ ] Slack bot token is kept secret
- [ ] Apple credentials are encrypted
- [ ] Environment variables not in version control
- [ ] SSL certificate installed
- [ ] Firewall configured (only 80/443 open)

## Support

For issues or questions:
1. Check this deployment guide
2. Review logs in worker and Next.js
3. Check GitHub issues
4. Contact maintainers

## License

ISC License - See LICENSE file for details
