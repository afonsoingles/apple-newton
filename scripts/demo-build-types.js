#!/usr/bin/env node

/**
 * Demo script to show the build type workflow
 * This demonstrates how the platform handles different build types
 */

const BuildType = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  CUSTOM: 'custom',
};

function getBundleIdentifier(baseBundleId, buildType) {
  if (buildType === BuildType.DEVELOPMENT) {
    return `${baseBundleId}.dev-build`;
  }
  return baseBundleId;
}

function requiresReview(buildType) {
  return buildType === BuildType.PRODUCTION || buildType === BuildType.CUSTOM;
}

console.log('=== Apple Newton Build Type Demo ===\n');

const baseBundleId = 'dev.afonso.myapp';

// Development Build
console.log('1. DEVELOPMENT BUILD');
console.log(`   Base Bundle ID: ${baseBundleId}`);
const devBundleId = getBundleIdentifier(baseBundleId, BuildType.DEVELOPMENT);
console.log(`   Final Bundle ID: ${devBundleId}`);
console.log(`   Requires Review: ${requiresReview(BuildType.DEVELOPMENT)}`);
console.log(`   ✓ Builds immediately, installs alongside production builds\n`);

// Production Build
console.log('2. PRODUCTION BUILD');
console.log(`   Base Bundle ID: ${baseBundleId}`);
const prodBundleId = getBundleIdentifier(baseBundleId, BuildType.PRODUCTION);
console.log(`   Final Bundle ID: ${prodBundleId}`);
console.log(`   Requires Review: ${requiresReview(BuildType.PRODUCTION)}`);
console.log(`   ⏳ Awaits admin approval before building\n`);

// Custom Build
console.log('3. CUSTOM BUILD');
console.log(`   Base Bundle ID: ${baseBundleId}`);
const customBundleId = getBundleIdentifier(baseBundleId, BuildType.CUSTOM);
console.log(`   Final Bundle ID: ${customBundleId}`);
console.log(`   Requires Review: ${requiresReview(BuildType.CUSTOM)}`);
console.log(`   ⏳ Awaits admin approval, uses custom EAS config\n`);

// Comparison
console.log('=== Bundle ID Comparison ===');
console.log(`Production:  ${prodBundleId}`);
console.log(`Development: ${devBundleId}`);
console.log(`Custom:      ${customBundleId}`);
console.log('\nNote: Development builds use .dev-build suffix to allow');
console.log('parallel installation with production builds on the same device.\n');

// Workflow Summary
console.log('=== Build Workflow Summary ===');
console.log(`
Development:
  User creates build → Auto-approved → Building → TestFlight

Production:
  User creates build → Admin review → Building → TestFlight → Apple review

Custom:
  User creates build → Admin review → Building → TestFlight → Apple review
`);
