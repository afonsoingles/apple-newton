import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { isValidGitHubIdentifier } from '@/lib/stringUtils';

const execAsync = promisify(exec);

interface BuildOptions {
  buildId: string;
  buildType: string;
  githubOwner: string;
  githubRepo: string;
  bundleIdentifier: string;
  easConfig?: any;
  environmentVariables: Record<string, string>;
}

/**
 * Execute EAS build
 */
export async function execBuild(options: BuildOptions): Promise<string> {
  const {
    buildId,
    buildType,
    githubOwner,
    githubRepo,
    bundleIdentifier,
    easConfig,
    environmentVariables,
  } = options;
  
  // Validate GitHub identifiers to prevent command injection
  if (!isValidGitHubIdentifier(githubOwner) || !isValidGitHubIdentifier(githubRepo)) {
    throw new Error('Invalid GitHub owner or repository name');
  }
  
  // Create temporary directory for this build
  const buildDir = join(tmpdir(), `apple-newton-build-${buildId}`);
  
  if (!existsSync(buildDir)) {
    mkdirSync(buildDir, { recursive: true });
  }
  
  try {
    console.log(`[EAS] Cloning repository ${githubOwner}/${githubRepo}`);
    
    // Clone the repository - inputs are now validated
    await execAsync(`git clone https://github.com/${githubOwner}/${githubRepo}.git ${buildDir}`);
    
    // Write environment variables to .env file
    if (Object.keys(environmentVariables).length > 0) {
      const envContent = Object.entries(environmentVariables)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      writeFileSync(join(buildDir, '.env'), envContent);
    }
    
    // Write custom EAS config if provided
    if (easConfig) {
      writeFileSync(
        join(buildDir, 'eas.json'),
        JSON.stringify(easConfig, null, 2)
      );
    }
    
    console.log(`[EAS] Installing dependencies`);
    await execAsync('npm install', { cwd: buildDir });
    
    // Determine build profile based on build type
    const profile = buildType === 'development' ? 'development' : 
                   buildType === 'custom' ? 'custom' : 'production';
    
    console.log(`[EAS] Running EAS build with profile: ${profile}`);
    
    // Run EAS build
    const buildCommand = process.env.EAS_LOCAL_BUILD === 'true'
      ? `npx eas-cli build --platform ios --profile ${profile} --local --non-interactive`
      : `npx eas-cli build --platform ios --profile ${profile} --non-interactive --no-wait`;
    
    const { stdout, stderr } = await execAsync(buildCommand, {
      cwd: buildDir,
      env: {
        ...process.env,
        EXPO_TOKEN: process.env.EXPO_TOKEN,
      },
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for logs
    });
    
    console.log('[EAS] Build output:', stdout);
    
    if (stderr) {
      console.error('[EAS] Build errors:', stderr);
    }
    
    // Extract IPA path from EAS output
    // For local builds, the IPA is in the build directory
    // For cloud builds, we get a download URL
    const ipaPath = extractIpaPath(stdout, buildDir);
    
    console.log(`[EAS] Build completed, IPA at: ${ipaPath}`);
    
    return ipaPath;
    
  } catch (error) {
    console.error('[EAS] Build failed:', error);
    throw new Error(`EAS build failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract IPA path from EAS build output
 */
function extractIpaPath(output: string, buildDir: string): string {
  // For local builds, look for the IPA file in the build directory
  if (output.includes('Build finished')) {
    const match = output.match(/Build artifact: (.+\.ipa)/);
    if (match) {
      return match[1];
    }
  }
  
  // For cloud builds, extract the download URL
  const urlMatch = output.match(/https:\/\/[^\s]+\.ipa/);
  if (urlMatch) {
    return urlMatch[0];
  }
  
  // Fallback: look for IPA in build directory
  const ipaPath = join(buildDir, 'build', `${Date.now()}.ipa`);
  
  if (existsSync(ipaPath)) {
    return ipaPath;
  }
  
  throw new Error('Could not find IPA file in build output');
}
