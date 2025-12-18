import Queue from 'bull';
import { prisma } from '@/lib/prisma';
import { BuildStatus } from '@/types';
import { decryptEnvironmentVariables } from '@/lib/encryption';
import { execBuild } from './easBuildExecutor';
import { uploadToAppStoreConnect } from './fastlaneUploader';
import { notifyBuildStatus } from './slackNotifier';
import { getRequiredEnv } from '@/lib/config';

// Initialize Bull queue with Redis
const buildQueue = new Queue('builds', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
});

/**
 * Add a build job to the queue
 */
export async function queueBuild(buildId: string): Promise<void> {
  await buildQueue.add('process-build', { buildId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000, // Start with 1 minute
    },
  });
}

/**
 * Process build jobs from the queue
 */
buildQueue.process('process-build', async (job) => {
  const { buildId } = job.data;
  
  console.log(`[Build Worker] Processing build ${buildId}`);
  
  try {
    // Update build status to building
    await updateBuildStatus(buildId, BuildStatus.BUILDING);
    
    // Fetch build data
    const build = await prisma.build.findUnique({
      where: { id: buildId },
      include: {
        app: {
          include: {
            user: true,
          },
        },
      },
    });
    
    if (!build) {
      throw new Error(`Build ${buildId} not found`);
    }
    
    // Decrypt environment variables
    const encryptionKey = getRequiredEnv('ENCRYPTION_KEY');
    let envVars: Record<string, string> = {};
    
    if (build.environmentVariables) {
      envVars = decryptEnvironmentVariables(
        build.environmentVariables as any,
        encryptionKey
      );
    }
    
    // Execute EAS build
    console.log(`[Build Worker] Running EAS build for ${buildId}`);
    const ipaPath = await execBuild({
      buildId,
      buildType: build.buildType,
      githubOwner: build.app.githubOwner,
      githubRepo: build.app.githubRepo,
      bundleIdentifier: build.bundleIdentifier,
      easConfig: build.easConfig as any,
      environmentVariables: envVars,
    });
    
    console.log(`[Build Worker] Build completed: ${ipaPath}`);
    
    // Update status to build success
    await updateBuildStatus(buildId, BuildStatus.BUILD_SUCCESS, { ipaUrl: ipaPath });
    
    // Upload to App Store Connect using Fastlane
    console.log(`[Build Worker] Uploading to App Store Connect`);
    await updateBuildStatus(buildId, BuildStatus.UPLOADING);
    
    await uploadToAppStoreConnect({
      ipaPath,
      bundleIdentifier: build.bundleIdentifier,
      appleReviewData: build.appleReviewData as any,
    });
    
    // Update final status
    await updateBuildStatus(buildId, BuildStatus.AWAITING_APPLE_REVIEW);
    
    // Send success notification
    if (build.app.user.slackUserId) {
      await notifyBuildStatus(build.app.user.slackUserId, {
        buildId,
        appName: build.app.name,
        buildType: build.buildType,
        status: 'success',
        message: 'Build completed and uploaded to TestFlight',
      });
    }
    
    console.log(`[Build Worker] Build ${buildId} completed successfully`);
    
  } catch (error) {
    console.error(`[Build Worker] Build ${buildId} failed:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Update build status to failed
    await updateBuildStatus(buildId, BuildStatus.BUILD_FAILED, {
      buildLogs: errorMessage,
    });
    
    // Fetch build for notification
    const build = await prisma.build.findUnique({
      where: { id: buildId },
      include: {
        app: {
          include: {
            user: true,
          },
        },
      },
    });
    
    // Send failure notification
    if (build?.app.user.slackUserId) {
      await notifyBuildStatus(build.app.user.slackUserId, {
        buildId,
        appName: build.app.name,
        buildType: build.buildType,
        status: 'failed',
        message: `Build failed: ${errorMessage}`,
      });
    }
    
    // Don't re-throw - error already handled, prevent duplicate retries
  }
});

/**
 * Update build status in database
 */
async function updateBuildStatus(
  buildId: string,
  status: BuildStatus,
  additionalData?: any
): Promise<void> {
  await prisma.build.update({
    where: { id: buildId },
    data: {
      status,
      ...additionalData,
    },
  });
}

// Event handlers
buildQueue.on('completed', (job) => {
  console.log(`[Build Queue] Job ${job.id} completed`);
});

buildQueue.on('failed', (job, err) => {
  console.error(`[Build Queue] Job ${job.id} failed:`, err);
});

buildQueue.on('error', (error) => {
  console.error('[Build Queue] Queue error:', error);
});

export { buildQueue };
