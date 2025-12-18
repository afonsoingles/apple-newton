import { BuildType } from '@/types';

/**
 * Adds .dev-build suffix to bundle identifier for development builds
 */
export function getBundleIdentifier(
  baseBundleId: string,
  buildType: BuildType
): string {
  if (buildType === BuildType.DEVELOPMENT) {
    return `${baseBundleId}.dev-build`;
  }
  return baseBundleId;
}

/**
 * Validates bundle identifier format
 */
export function isValidBundleIdentifier(bundleId: string): boolean {
  // Bundle ID should match pattern: com.company.appname
  const bundleIdRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
  return bundleIdRegex.test(bundleId);
}

/**
 * Extracts the base bundle identifier (removes .dev-build suffix if present)
 */
export function getBaseBundleIdentifier(bundleId: string): string {
  if (bundleId.endsWith('.dev-build')) {
    return bundleId.slice(0, -'.dev-build'.length);
  }
  return bundleId;
}
