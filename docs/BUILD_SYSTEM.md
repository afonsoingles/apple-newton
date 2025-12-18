# Build System Documentation

## Build Types

Apple Newton supports three distinct build types, each with different characteristics and requirements:

### 1. Development Builds

**Purpose**: For testing and development with Expo development server.

**Characteristics**:
- Bundle ID gets `.dev-build` suffix automatically
- Example: `dev.afonso.cat` → `dev.afonso.cat.dev-build`
- No admin verification required
- Builds start immediately after creation
- Uses Expo development build profile

**Why the suffix?**
Apple doesn't allow users to switch between different app versions using the same bundle identifier in TestFlight. The `.dev-build` suffix allows developers to have both production and development builds installed simultaneously on the same device.

**Use Cases**:
- Testing new features
- Running with Expo development server
- Quick iterations during development
- Testing with different dependency versions

**Workflow**:
```
User creates dev build
    ↓
Bundle ID modified with .dev-build
    ↓
Build immediately queued
    ↓
EAS builds the app
    ↓
IPA uploaded to App Store Connect
    ↓
User notified via Slack
```

### 2. Production Builds

**Purpose**: Production-ready releases for end users.

**Characteristics**:
- Uses original bundle ID (no suffix)
- Requires admin review before building
- Uses default EAS production profile
- Must pass Apple's TestFlight review
- Published to TestFlight after approval

**Security Review**:
Production builds are reviewed by admins to ensure:
- No malware or malicious code
- Compliance with Code of Conduct
- Proper configuration
- No security vulnerabilities

**Use Cases**:
- Official releases
- Public beta testing
- App Store submission preparation
- Stable builds for stakeholders

**Workflow**:
```
User creates production build
    ↓
Status: awaiting_review
    ↓
Admin reviews build config
    ↓
If approved → Build queued
If rejected → User notified
    ↓
EAS builds the app
    ↓
IPA uploaded to App Store Connect
    ↓
Prefill app metadata
    ↓
User submits Apple review data
    ↓
Awaiting Apple review
    ↓
Published to TestFlight
    ↓
User notified via Slack
```

### 3. Custom Builds

**Purpose**: Advanced users who need custom EAS configurations.

**Characteristics**:
- User provides custom `eas.json` configuration
- Requires admin review before building
- Flexible build settings
- Support for advanced EAS features

**Security Review**:
Custom builds are reviewed to ensure:
- Configuration doesn't violate policies
- No malicious build scripts
- Proper resource usage
- Security compliance

**Use Cases**:
- Custom build plugins
- Specific iOS versions
- Custom provisioning profiles
- Advanced optimization settings
- Special build environments

**Custom Configuration Example**:
```json
{
  "build": {
    "custom": {
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release",
        "scheme": "MyApp",
        "cache": {
          "key": "custom-cache-key"
        }
      }
    }
  }
}
```

**Workflow**:
Same as production builds, but with custom EAS configuration applied during the build process.

## Bundle Identifier Management

### Automatic Suffix for Development

The platform automatically manages bundle identifiers based on build type:

```typescript
// Production or Custom
bundleIdentifier = "dev.afonso.cat"

// Development
bundleIdentifier = "dev.afonso.cat.dev-build"
```

### Implementation

The bundle ID logic is in `src/lib/bundleId.ts`:

```typescript
export function getBundleIdentifier(
  baseBundleId: string,
  buildType: BuildType
): string {
  if (buildType === BuildType.DEVELOPMENT) {
    return `${baseBundleId}.dev-build`;
  }
  return baseBundleId;
}
```

### Benefits

1. **Parallel Installation**: Install both dev and prod builds simultaneously
2. **Clear Separation**: Easy to distinguish between development and production
3. **No Conflicts**: Avoid TestFlight version conflicts
4. **Automatic**: Users don't need to manually manage bundle IDs

## Environment Variables

### Security Model

Environment variables are encrypted using AES-256-GCM encryption to ensure security:

1. **User Side**: Variables encrypted before storage
2. **Storage**: Only encrypted data stored in database
3. **Build Worker**: Decrypts using shared encryption key
4. **After Build**: Decrypted values discarded

### Encryption Process

The encryption uses the `scrypt` key derivation function to ensure secure key handling:

```typescript
// Encrypt (User → Database)
const encrypted = encryptEnvironmentVariables(
  { API_KEY: "secret" },
  encryptionKey
);

// Store in database
{
  encryptedValue: "...",
  iv: "...",
  authTag: "..."
}

// Decrypt (Build Worker → EAS)
const envVars = decryptEnvironmentVariables(
  encrypted,
  encryptionKey
);
```

**Security Features**:
- Uses `scrypt` key derivation to prevent weak key attacks
- Unique initialization vector (IV) for each encryption
- Authentication tag for integrity verification
- No hardcoded encryption keys (application fails to start if key is missing)

### Key Management

- Encryption key stored in secure environment variable (`ENCRYPTION_KEY`)
- Must be at least 32 characters long
- Not accessible through API
- Unique key per deployment
- Regular rotation recommended
- Generate with: `openssl rand -hex 32`

## Build Status Lifecycle

A build goes through several states:

```
PENDING (initial)
    ↓
AWAITING_REVIEW (production/custom only)
    ↓
APPROVED (after admin review)
    ↓
BUILDING (during EAS build)
    ↓
BUILD_SUCCESS or BUILD_FAILED
    ↓
UPLOADING (to App Store Connect)
    ↓
UPLOAD_FAILED or AWAITING_APPLE_REVIEW
    ↓
APPLE_REVIEW_REJECTED or PUBLISHED
```

### Development Build Flow
```
PENDING → BUILDING → BUILD_SUCCESS → UPLOADING → PUBLISHED
```

### Production/Custom Build Flow
```
PENDING → AWAITING_REVIEW → APPROVED → BUILDING → 
BUILD_SUCCESS → UPLOADING → AWAITING_APPLE_REVIEW → PUBLISHED
```

## Build Worker Implementation

The build worker is responsible for:

1. **Repository Preparation**
   - Clone GitHub repository
   - Checkout specified branch/commit
   - Verify repository structure

2. **Environment Setup**
   - Decrypt environment variables
   - Create `.env` file for build
   - Inject into build context

3. **EAS Build Execution**
   ```bash
   eas build --platform ios --profile {buildType} --non-interactive
   ```

4. **Artifact Collection**
   - Download generated IPA
   - Store build logs
   - Collect metadata

5. **Upload to App Store Connect**
   ```bash
   fastlane deliver --ipa path/to/app.ipa
   ```

6. **Cleanup**
   - Remove temporary files
   - Clear decrypted environment variables
   - Update build status

## Integration Points

### EAS Cloud
- Uses Expo's cloud build infrastructure
- No local resources required
- Faster build times
- Automatic caching

### EAS Local
For self-hosted builds:
```bash
eas build --local --platform ios --profile {buildType}
```

Benefits:
- More control over build environment
- Custom build machines
- Network isolation
- Cost savings for high volume

### Fastlane
Used for App Store Connect operations:
- IPA upload
- Metadata management
- Screenshot upload
- TestFlight distribution

Example configuration:
```ruby
lane :upload_to_testflight do
  upload_to_testflight(
    ipa: "path/to/app.ipa",
    skip_waiting_for_build_processing: true
  )
end
```

## Apple Review Process

### Required Information

Before submitting to Apple review:
- Demo account credentials (if app requires login)
- Testing instructions
- Contact information
- Notes about app functionality

### Review Data Structure

```typescript
interface AppleReviewData {
  demoCredentials?: {
    username?: string;
    password?: string;
  };
  instructions?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}
```

### Automation

1. Build uploaded via Fastlane
2. Review data submitted via App Store Connect API
3. Webhook monitors review status
4. Automatic TestFlight publication on approval
5. Slack notification sent to user

## Notification System

### Slack Integration

Users receive notifications for:
- Build started
- Build completed (success/failure)
- Admin review decisions
- Apple review status updates
- TestFlight publication

### Notification Format

```
🚀 Build Started
App: MyApp
Type: Production
Status: Building...

✅ Build Completed
App: MyApp
Type: Production
Build URL: [link]
TestFlight: [link]
```

## Error Handling

### Common Build Failures

1. **Invalid app.json**
   - Error: Missing bundle identifier
   - Solution: Update app.json with required fields

2. **Build Dependencies**
   - Error: Native module compilation failed
   - Solution: Check package versions and compatibility

3. **Code Signing**
   - Error: Certificate expired
   - Solution: Update certificates in platform

4. **Upload Failures**
   - Error: App Store Connect authentication
   - Solution: Verify API keys and permissions

### Retry Logic

- Build failures: User can retry manually
- Upload failures: Automatic retry (3 attempts)
- Transient errors: Exponential backoff

## Best Practices

### For Users

1. **Development Builds**
   - Use for rapid iteration
   - Test frequently
   - Don't share widely

2. **Production Builds**
   - Thoroughly test before requesting
   - Provide complete review information
   - Update app metadata

3. **Environment Variables**
   - Use different values for dev/prod
   - Rotate secrets regularly
   - Don't commit to repository

### For Admins

1. **Build Reviews**
   - Check for malicious code
   - Verify proper configuration
   - Review custom EAS configs carefully
   - Provide clear feedback

2. **Certificate Management**
   - Monitor expiration dates
   - Rotate before expiry
   - Keep backups secure

## Troubleshooting

### Build Stuck in Queue
- Check build worker status
- Verify EAS service status
- Review build logs

### Upload Failed
- Verify App Store Connect API keys
- Check bundle ID registration
- Review Fastlane logs

### Encryption Issues
- Verify encryption key is set
- Check key format (32 bytes)
- Review environment variable structure

## Future Enhancements

- [ ] Build caching for faster builds
- [ ] Parallel builds for multiple platforms
- [ ] Advanced analytics and metrics
- [ ] Custom notification preferences
- [ ] Build templates
- [ ] Automated testing integration
- [ ] Build scheduling
- [ ] Resource usage monitoring
