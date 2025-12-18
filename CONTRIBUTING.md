# Contributing to Apple Newton

Thank you for your interest in contributing to Apple Newton! This guide will help you get started.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Git

### Setting Up Development Environment

1. Fork and clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/apple-newton.git
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

Edit `.env` with your development configuration.

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Set up the database:
```bash
npx prisma db push
```

6. Run the development server:
```bash
npm run dev
```

## Development Workflow

### Running Tests

Always run tests before submitting a pull request:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

Check test coverage:

```bash
npm run test:coverage
```

### Code Style

We use ESLint for code linting. Run the linter before committing:

```bash
npm run lint
```

### Building

Ensure your changes build successfully:

```bash
npm run build
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`

Example:
```bash
git checkout -b feature/add-slack-notifications
```

### Commit Messages

Write clear, descriptive commit messages:

```
Add Slack notification system

- Implement webhook for build status updates
- Add Slack API integration
- Create notification templates
```

### Pull Requests

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update the README if necessary
5. Create a pull request with a clear description

## Project Structure

```
apple-newton/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   └── page.tsx      # Frontend pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   │   ├── appConfig.ts  # App.json parsing
│   │   ├── bundleId.ts   # Bundle ID utilities
│   │   ├── buildService.ts # Build workflow
│   │   ├── encryption.ts # Encryption utilities
│   │   ├── github.ts     # GitHub integration
│   │   └── prisma.ts     # Prisma client
│   └── types/           # TypeScript types
├── prisma/
│   └── schema.prisma    # Database schema
├── tests/               # Test files
├── docs/                # Documentation
└── scripts/             # Utility scripts
```

## Adding New Features

### 1. API Endpoints

Create new API routes in `src/app/api/`:

```typescript
// src/app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Your implementation
  return NextResponse.json({ data: 'result' });
}
```

### 2. Database Models

Add new models in `prisma/schema.prisma`:

```prisma
model NewModel {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

After updating the schema, generate the client:

```bash
npx prisma generate
npx prisma db push
```

### 3. Utility Functions

Add reusable utilities in `src/lib/`:

```typescript
// src/lib/yourUtility.ts
export function yourFunction(param: string): string {
  // Implementation
  return result;
}
```

### 4. Type Definitions

Add types in `src/types/index.ts`:

```typescript
export interface NewType {
  id: string;
  name: string;
}
```

### 5. Tests

Add tests in `tests/`:

```typescript
// tests/yourFeature.test.ts
import { describe, test, expect } from '@jest/globals';
import { yourFunction } from '../src/lib/yourUtility';

describe('Your Feature', () => {
  test('should do something', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected');
  });
});
```

## Testing Guidelines

### Writing Good Tests

- Test one thing at a time
- Use descriptive test names
- Cover edge cases
- Mock external dependencies

Example:

```typescript
describe('Bundle ID Utilities', () => {
  test('adds .dev-build suffix for development builds', () => {
    const result = getBundleIdentifier('dev.app', BuildType.DEVELOPMENT);
    expect(result).toBe('dev.app.dev-build');
  });
  
  test('handles empty bundle ID', () => {
    expect(() => getBundleIdentifier('', BuildType.DEVELOPMENT))
      .toThrow('Invalid bundle identifier');
  });
});
```

## Documentation

### Code Documentation

Use JSDoc comments for functions:

```typescript
/**
 * Encrypts environment variables using AES-256-GCM
 * @param envVars - Object containing environment variables
 * @param encryptionKey - 32-byte encryption key
 * @returns Encrypted data with IV and auth tag
 */
export function encryptEnvironmentVariables(
  envVars: Record<string, string>,
  encryptionKey: string
): EncryptedData {
  // Implementation
}
```

### API Documentation

Update `docs/API.md` when adding new endpoints.

### README Updates

Update the main README if adding major features.

## Common Issues

### Prisma Client Not Found

```bash
npx prisma generate
```

### Build Failures

Clear Next.js cache:

```bash
rm -rf .next
npm run build
```

### Test Failures

Ensure you're using the correct Node.js version:

```bash
node --version  # Should be 18+
```

## Getting Help

- Check existing issues on GitHub
- Read the documentation in `/docs`
- Review the README
- Ask questions in pull request discussions

## Review Process

Pull requests will be reviewed for:
1. Code quality and style
2. Test coverage
3. Documentation completeness
4. Adherence to project architecture
5. Security considerations

## Security

If you discover a security vulnerability, please email the maintainers directly instead of opening a public issue.

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

## Thank You!

Your contributions help make Apple Newton better for everyone!
