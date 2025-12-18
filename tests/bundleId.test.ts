import { describe, test, expect } from '@jest/globals';
import { getBundleIdentifier, isValidBundleIdentifier, getBaseBundleIdentifier } from '../src/lib/bundleId';
import { BuildType } from '../src/types';

describe('Bundle ID Utilities', () => {
  test('getBundleIdentifier adds .dev-build suffix for development builds', () => {
    const baseBundleId = 'dev.afonso.cat';
    const result = getBundleIdentifier(baseBundleId, BuildType.DEVELOPMENT);
    expect(result).toBe('dev.afonso.cat.dev-build');
  });

  test('getBundleIdentifier returns original ID for production builds', () => {
    const baseBundleId = 'dev.afonso.cat';
    const result = getBundleIdentifier(baseBundleId, BuildType.PRODUCTION);
    expect(result).toBe('dev.afonso.cat');
  });

  test('getBundleIdentifier returns original ID for custom builds', () => {
    const baseBundleId = 'dev.afonso.cat';
    const result = getBundleIdentifier(baseBundleId, BuildType.CUSTOM);
    expect(result).toBe('dev.afonso.cat');
  });

  test('isValidBundleIdentifier validates correct bundle IDs', () => {
    expect(isValidBundleIdentifier('com.example.app')).toBe(true);
    expect(isValidBundleIdentifier('dev.afonso.cat')).toBe(true);
    expect(isValidBundleIdentifier('com.company.app.dev-build')).toBe(true);
  });

  test('isValidBundleIdentifier rejects invalid bundle IDs', () => {
    expect(isValidBundleIdentifier('invalid')).toBe(false);
    expect(isValidBundleIdentifier('.')).toBe(false);
    expect(isValidBundleIdentifier('')).toBe(false);
  });

  test('getBaseBundleIdentifier removes .dev-build suffix', () => {
    expect(getBaseBundleIdentifier('dev.afonso.cat.dev-build')).toBe('dev.afonso.cat');
  });

  test('getBaseBundleIdentifier returns original if no suffix', () => {
    expect(getBaseBundleIdentifier('dev.afonso.cat')).toBe('dev.afonso.cat');
  });
});
