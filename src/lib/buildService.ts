import { BuildType, BuildStatus, CreateBuildRequest, Build } from '@/types';
import { prisma } from './prisma';
import { getBundleIdentifier } from './bundleId';
import { encryptEnvironmentVariables } from './encryption';

/**
 * Creates a new build request
 */
export async function createBuild(
  request: CreateBuildRequest,
  userId: string,
  encryptionKey: string
): Promise<Build> {
  // Fetch the app to get base bundle identifier
  const app = await prisma.app.findUnique({
    where: { id: request.appId },
  });
  
  if (!app) {
    throw new Error('App not found');
  }
  
  if (app.userId !== userId) {
    throw new Error('Unauthorized');
  }
  
  // Calculate final bundle identifier based on build type
  const bundleIdentifier = getBundleIdentifier(
    app.bundleIdentifier,
    request.buildType
  );
  
  // Encrypt environment variables if provided
  let encryptedEnvVars = null;
  if (request.environmentVariables) {
    encryptedEnvVars = encryptEnvironmentVariables(
      request.environmentVariables,
      encryptionKey
    );
  }
  
  // Determine initial status based on build type
  let initialStatus = BuildStatus.PENDING;
  if (
    request.buildType === BuildType.PRODUCTION ||
    request.buildType === BuildType.CUSTOM
  ) {
    initialStatus = BuildStatus.AWAITING_REVIEW;
  }
  
  const build = await prisma.build.create({
    data: {
      appId: request.appId,
      buildType: request.buildType,
      status: initialStatus,
      bundleIdentifier,
      easConfig: request.easConfig || null,
      environmentVariables: encryptedEnvVars
        ? (encryptedEnvVars as any)
        : null,
      appleReviewData: request.appleReviewData
        ? (request.appleReviewData as any)
        : undefined,
    },
  });
  
  // For development builds, start building immediately
  if (request.buildType === BuildType.DEVELOPMENT) {
    // Queue build job (in real implementation, this would trigger a worker)
    await queueBuildJob(build.id);
  }
  
  return {
    ...build,
    createdAt: new Date(build.createdAt),
    updatedAt: new Date(build.updatedAt),
  } as unknown as Build;
}

/**
 * Reviews and approves/rejects a build
 */
export async function reviewBuild(
  buildId: string,
  reviewerId: string,
  approved: boolean,
  notes?: string
): Promise<void> {
  const build = await prisma.build.findUnique({
    where: { id: buildId },
  });
  
  if (!build) {
    throw new Error('Build not found');
  }
  
  if (build.status !== BuildStatus.AWAITING_REVIEW) {
    throw new Error('Build is not awaiting review');
  }
  
  await prisma.buildReview.create({
    data: {
      buildId,
      reviewerId,
      approved,
      notes: notes || null,
    },
  });
  
  if (approved) {
    await prisma.build.update({
      where: { id: buildId },
      data: { status: BuildStatus.APPROVED },
    });
    
    // Queue build job
    await queueBuildJob(buildId);
  } else {
    await prisma.build.update({
      where: { id: buildId },
      data: { status: BuildStatus.REJECTED },
    });
  }
}

/**
 * Updates build status
 */
export async function updateBuildStatus(
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

/**
 * Queues a build job using Bull queue
 */
async function queueBuildJob(buildId: string): Promise<void> {
  // Only queue in server environment
  if (typeof window === 'undefined') {
    // Update status immediately
    await prisma.build.update({
      where: { id: buildId },
      data: { status: BuildStatus.BUILDING },
    });
    
    try {
      // In runtime (not during build), try to queue
      if (process.env.NODE_ENV !== 'test') {
        // Use eval to prevent Next.js from bundling Bull
        const workerModule = await eval('import("@/workers/buildWorker")');
        await workerModule.queueBuild(buildId);
        console.log(`Build ${buildId} queued for processing`);
      }
    } catch (error) {
      console.error('Failed to queue build (will remain in BUILDING status):', error);
      // Status already updated above, worker can pick it up manually
    }
  } else {
    console.log(`Build ${buildId} queued on server`);
  }
  
  console.log(`Build ${buildId} queued for processing`);
}

/**
 * Checks if a build requires review
 */
export function requiresReview(buildType: BuildType): boolean {
  return buildType === BuildType.PRODUCTION || buildType === BuildType.CUSTOM;
}
