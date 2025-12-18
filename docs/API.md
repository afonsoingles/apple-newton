# API Documentation

## Overview

The Apple Newton API provides endpoints for managing apps and builds on the iOS build platform.

## Authentication

All API requests require authentication via the `x-user-id` header. In a production environment, this would be replaced with proper session-based authentication using OAuth tokens.

```http
x-user-id: <user-id>
```

## Endpoints

### Apps

#### GET /api/apps

List all apps for the authenticated user.

**Request:**
```http
GET /api/apps
x-user-id: user-123
```

**Response:**
```json
[
  {
    "id": "app-1",
    "userId": "user-123",
    "name": "My App",
    "bundleIdentifier": "dev.afonso.myapp",
    "githubRepo": "myapp",
    "githubOwner": "afonsoingles",
    "appConfig": { /* app.json content */ },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/apps

Create a new app by linking a GitHub repository.

**Request:**
```http
POST /api/apps
x-user-id: user-123
Content-Type: application/json

{
  "githubOwner": "afonsoingles",
  "githubRepo": "myapp"
}
```

**Response:**
```json
{
  "id": "app-1",
  "userId": "user-123",
  "name": "My App",
  "bundleIdentifier": "dev.afonso.myapp",
  "githubRepo": "myapp",
  "githubOwner": "afonsoingles",
  "appConfig": { /* app.json content */ },
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid repository
- `403 Forbidden`: Cannot access GitHub repository
- `500 Internal Server Error`: Server error

### Builds

#### GET /api/builds

List all builds for the authenticated user. Optionally filter by app ID.

**Request:**
```http
GET /api/builds?appId=app-1
x-user-id: user-123
```

**Response:**
```json
[
  {
    "id": "build-1",
    "appId": "app-1",
    "buildType": "development",
    "status": "building",
    "bundleIdentifier": "dev.afonso.myapp.dev-build",
    "easConfig": null,
    "environmentVariables": { /* encrypted */ },
    "ipaUrl": null,
    "buildLogs": null,
    "appleReviewData": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "app": {
      "id": "app-1",
      "name": "My App",
      "bundleIdentifier": "dev.afonso.myapp"
    },
    "review": null
  }
]
```

#### POST /api/builds

Create a new build request.

**Request (Development Build):**
```http
POST /api/builds
x-user-id: user-123
Content-Type: application/json

{
  "appId": "app-1",
  "buildType": "development",
  "environmentVariables": {
    "API_KEY": "secret-key-123"
  }
}
```

**Request (Production Build):**
```http
POST /api/builds
x-user-id: user-123
Content-Type: application/json

{
  "appId": "app-1",
  "buildType": "production",
  "environmentVariables": {
    "API_KEY": "secret-key-123"
  },
  "appleReviewData": {
    "demoCredentials": {
      "username": "demo@example.com",
      "password": "demo123"
    },
    "instructions": "Login with demo credentials",
    "contactEmail": "support@example.com"
  }
}
```

**Request (Custom Build):**
```http
POST /api/builds
x-user-id: user-123
Content-Type: application/json

{
  "appId": "app-1",
  "buildType": "custom",
  "easConfig": {
    "build": {
      "custom": {
        "ios": {
          "simulator": false,
          "buildConfiguration": "Release"
        }
      }
    }
  },
  "environmentVariables": {
    "API_KEY": "secret-key-123"
  }
}
```

**Response:**
```json
{
  "id": "build-1",
  "appId": "app-1",
  "buildType": "development",
  "status": "building",
  "bundleIdentifier": "dev.afonso.myapp.dev-build",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid build type or missing required fields
- `401 Unauthorized`: Missing authentication
- `500 Internal Server Error`: Server error

### Build Reviews

#### POST /api/builds/review

Review a build (admin only). Approve or reject a production or custom build.

**Request:**
```http
POST /api/builds/review
x-user-id: admin-user-123
Content-Type: application/json

{
  "buildId": "build-1",
  "approved": true,
  "notes": "Build looks good, approved for production"
}
```

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: User is not an admin
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Server error

## Build Types

### Development

- **Bundle ID**: Original bundle ID + `.dev-build` suffix
- **Review Required**: No
- **Initial Status**: `pending` → `building`
- **Use Case**: Quick iterations, testing with Expo development server

### Production

- **Bundle ID**: Original bundle ID (no suffix)
- **Review Required**: Yes
- **Initial Status**: `awaiting_review`
- **Use Case**: Production releases, public beta testing

### Custom

- **Bundle ID**: Original bundle ID (no suffix)
- **Review Required**: Yes
- **Initial Status**: `awaiting_review`
- **Use Case**: Advanced configurations, custom EAS settings

## Build Status Lifecycle

```
Development:
  pending → building → build_success → uploading → published

Production/Custom:
  pending → awaiting_review → approved → building → build_success 
  → uploading → awaiting_apple_review → published

Failed states:
  build_failed, upload_failed, rejected, apple_review_rejected
```

## Environment Variables

Environment variables are encrypted using AES-256-GCM before storage. When creating a build, provide them as a plain object:

```json
{
  "environmentVariables": {
    "API_KEY": "your-api-key",
    "DATABASE_URL": "postgresql://...",
    "CUSTOM_VAR": "value"
  }
}
```

The build worker will decrypt these variables during the build process.

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently not implemented. In production, rate limiting should be added to prevent abuse.

## Webhooks (Future)

Future implementation will include webhooks for:
- Build status updates
- Apple review status changes
- TestFlight publication events

## SDK Examples

### JavaScript/TypeScript

```typescript
// Create an app
const response = await fetch('http://localhost:3000/api/apps', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'user-123',
  },
  body: JSON.stringify({
    githubOwner: 'afonsoingles',
    githubRepo: 'myapp',
  }),
});

const app = await response.json();

// Create a development build
const buildResponse = await fetch('http://localhost:3000/api/builds', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'user-123',
  },
  body: JSON.stringify({
    appId: app.id,
    buildType: 'development',
    environmentVariables: {
      API_KEY: 'secret-key',
    },
  }),
});

const build = await buildResponse.json();
```

### cURL

```bash
# Create an app
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "githubOwner": "afonsoingles",
    "githubRepo": "myapp"
  }'

# Create a development build
curl -X POST http://localhost:3000/api/builds \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "appId": "app-1",
    "buildType": "development",
    "environmentVariables": {
      "API_KEY": "secret-key"
    }
  }'

# Admin reviews a build
curl -X POST http://localhost:3000/api/builds/review \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin-123" \
  -d '{
    "buildId": "build-1",
    "approved": true,
    "notes": "Looks good!"
  }'
```
