/**
 * String utility functions
 */

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Validates GitHub repository owner and name
 */
export function isValidGitHubIdentifier(identifier: string): boolean {
  // GitHub username/repo can only contain alphanumeric, hyphen, and underscore
  return /^[a-zA-Z0-9_-]+$/.test(identifier);
}
