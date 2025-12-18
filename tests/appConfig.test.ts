import { describe, test, expect } from '@jest/globals';
import { parseAppJson, validateAppConfig } from '../src/lib/appConfig';

describe('App Config Parser', () => {
  test('parseAppJson extracts bundle identifier from iOS config', async () => {
    const appJson = JSON.stringify({
      expo: {
        name: 'My App',
        ios: {
          bundleIdentifier: 'dev.afonso.myapp',
        },
      },
    });

    const config = await parseAppJson(appJson);
    expect(config.name).toBe('My App');
    expect(config.bundleIdentifier).toBe('dev.afonso.myapp');
  });

  test('parseAppJson handles root-level config', async () => {
    const appJson = JSON.stringify({
      name: 'My App',
      bundleIdentifier: 'dev.afonso.myapp',
    });

    const config = await parseAppJson(appJson);
    expect(config.name).toBe('My App');
    expect(config.bundleIdentifier).toBe('dev.afonso.myapp');
  });

  test('parseAppJson throws error for missing bundle identifier', async () => {
    const appJson = JSON.stringify({
      expo: {
        name: 'My App',
      },
    });

    await expect(parseAppJson(appJson)).rejects.toThrow('Bundle identifier not found');
  });

  test('validateAppConfig validates correct config', () => {
    const config = {
      name: 'My App',
      bundleIdentifier: 'dev.afonso.myapp',
    };

    const result = validateAppConfig(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validateAppConfig detects missing name', () => {
    const config = {
      name: '',
      bundleIdentifier: 'dev.afonso.myapp',
    };

    const result = validateAppConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('App name is required');
  });

  test('validateAppConfig detects invalid bundle identifier', () => {
    const config = {
      name: 'My App',
      bundleIdentifier: 'invalid',
    };

    const result = validateAppConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid bundle identifier format');
  });
});
