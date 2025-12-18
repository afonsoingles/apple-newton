import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { AppleReviewData } from '@/types';

const execAsync = promisify(exec);

interface UploadOptions {
  ipaPath: string;
  bundleIdentifier: string;
  appleReviewData?: AppleReviewData;
}

/**
 * Upload IPA to App Store Connect using Fastlane
 */
export async function uploadToAppStoreConnect(options: UploadOptions): Promise<void> {
  const { ipaPath, bundleIdentifier, appleReviewData } = options;
  
  console.log(`[Fastlane] Uploading ${ipaPath} to App Store Connect`);
  
  // Create Fastlane directory
  const fastlaneDir = join(tmpdir(), 'fastlane');
  
  if (!existsSync(fastlaneDir)) {
    mkdirSync(fastlaneDir, { recursive: true });
  }
  
  // Create Fastfile
  const fastfilePath = join(fastlaneDir, 'Fastfile');
  const fastfileContent = generateFastfile(bundleIdentifier, appleReviewData);
  
  writeFileSync(fastfilePath, fastfileContent);
  
  // Create Appfile
  const appfilePath = join(fastlaneDir, 'Appfile');
  const appfileContent = `
app_identifier("${bundleIdentifier}")
apple_id("${process.env.APPLE_ID || ''}")
team_id("${process.env.APPLE_TEAM_ID || ''}")
`;
  
  writeFileSync(appfilePath, appfileContent);
  
  try {
    // Run Fastlane upload
    const { stdout, stderr } = await execAsync(
      `fastlane upload_to_testflight ipa_path:"${ipaPath}"`,
      {
        cwd: dirname(fastlaneDir),
        env: {
          ...process.env,
          FASTLANE_USER: process.env.APPLE_ID,
          FASTLANE_PASSWORD: process.env.APPLE_PASSWORD,
          FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD: process.env.APPLE_APP_SPECIFIC_PASSWORD,
          APP_STORE_CONNECT_API_KEY_ID: process.env.APP_STORE_CONNECT_KEY_ID,
          APP_STORE_CONNECT_API_ISSUER_ID: process.env.APP_STORE_CONNECT_ISSUER_ID,
          APP_STORE_CONNECT_API_KEY: process.env.APP_STORE_CONNECT_PRIVATE_KEY,
        },
      }
    );
    
    console.log('[Fastlane] Upload output:', stdout);
    
    if (stderr) {
      console.warn('[Fastlane] Upload warnings:', stderr);
    }
    
    console.log('[Fastlane] Upload completed successfully');
    
  } catch (error) {
    console.error('[Fastlane] Upload failed:', error);
    throw new Error(`Fastlane upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate Fastfile content
 */
function generateFastfile(bundleIdentifier: string, reviewData?: AppleReviewData): string {
  return `
default_platform(:ios)

platform :ios do
  desc "Upload to TestFlight"
  lane :upload_to_testflight do |options|
    ipa_path = options[:ipa_path]
    
    # Upload to TestFlight
    upload_to_testflight(
      ipa: ipa_path,
      skip_waiting_for_build_processing: false,
      distribute_external: false,
      ${reviewData?.demoCredentials ? `
      demo_account_required: true,
      beta_app_review_info: {
        contact_email: "${reviewData.contactEmail || ''}",
        contact_first_name: "Demo",
        contact_last_name: "User",
        contact_phone: "${reviewData.contactPhone || ''}",
        demo_account_name: "${reviewData.demoCredentials.username || ''}",
        demo_account_password: "${reviewData.demoCredentials.password || ''}",
        notes: "${reviewData.instructions || ''}"
      },
      ` : ''}
      changelog: "Build uploaded via Apple Newton"
    )
  end
end
`;
}

/**
 * Check Fastlane installation
 */
export async function checkFastlaneInstalled(): Promise<boolean> {
  try {
    await execAsync('which fastlane');
    return true;
  } catch {
    return false;
  }
}

/**
 * Install Fastlane if not present
 */
export async function ensureFastlaneInstalled(): Promise<void> {
  const installed = await checkFastlaneInstalled();
  
  if (!installed) {
    console.log('[Fastlane] Installing Fastlane...');
    await execAsync('gem install fastlane');
    console.log('[Fastlane] Fastlane installed successfully');
  }
}
