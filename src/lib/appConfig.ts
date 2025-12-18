import { AppConfig } from '@/types';

/**
 * Parses app.json and extracts necessary information
 */
export async function parseAppJson(appJsonContent: string): Promise<AppConfig> {
  try {
    const config = JSON.parse(appJsonContent);
    
    // Handle expo config structure
    const expoConfig = config.expo || config;
    
    // Extract bundle identifier from iOS config or fallback
    const bundleIdentifier =
      expoConfig.ios?.bundleIdentifier ||
      expoConfig.bundleIdentifier ||
      '';
    
    if (!bundleIdentifier) {
      throw new Error('Bundle identifier not found in app.json');
    }
    
    return {
      name: expoConfig.name || expoConfig.displayName || '',
      bundleIdentifier,
      version: expoConfig.version,
      icon: expoConfig.icon,
      splash: expoConfig.splash,
      ios: expoConfig.ios,
      ...expoConfig,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse app.json: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validates app.json structure
 */
export function validateAppConfig(config: AppConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!config.name) {
    errors.push('App name is required');
  }
  
  if (!config.bundleIdentifier) {
    errors.push('Bundle identifier is required');
  }
  
  const bundleIdRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
  if (config.bundleIdentifier && !bundleIdRegex.test(config.bundleIdentifier)) {
    errors.push('Invalid bundle identifier format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
