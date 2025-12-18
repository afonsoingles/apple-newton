# Scripts

This directory contains utility scripts for the Apple Newton platform.

## Available Scripts

### demo-build-types.js

Demonstrates the three build types and their behavior:

```bash
node scripts/demo-build-types.js
```

This script shows:
- How bundle IDs are modified for each build type
- Which build types require admin review
- The workflow for each build type

Output example:
```
=== Apple Newton Build Type Demo ===

1. DEVELOPMENT BUILD
   Base Bundle ID: dev.afonso.myapp
   Final Bundle ID: dev.afonso.myapp.dev-build
   Requires Review: false
   ✓ Builds immediately, installs alongside production builds
...
```
