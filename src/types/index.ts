/**
 * Build types supported by the platform
 */
export enum BuildType {
  /** Development build with .dev-build suffix, no verification required */
  DEVELOPMENT = 'development',
  /** Production build, requires admin review */
  PRODUCTION = 'production',
  /** Custom EAS configuration, requires admin review */
  CUSTOM = 'custom',
}

/**
 * Build status tracking
 */
export enum BuildStatus {
  PENDING = 'pending',
  AWAITING_REVIEW = 'awaiting_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  BUILDING = 'building',
  BUILD_FAILED = 'build_failed',
  BUILD_SUCCESS = 'build_success',
  UPLOADING = 'uploading',
  UPLOAD_FAILED = 'upload_failed',
  AWAITING_APPLE_REVIEW = 'awaiting_apple_review',
  APPLE_REVIEW_REJECTED = 'apple_review_rejected',
  PUBLISHED = 'published',
}

/**
 * App configuration from app.json
 */
export interface AppConfig {
  name: string;
  bundleIdentifier: string;
  version?: string;
  icon?: string;
  splash?: any;
  ios?: {
    bundleIdentifier?: string;
    buildNumber?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * App model
 */
export interface App {
  id: string;
  userId: string;
  name: string;
  bundleIdentifier: string;
  githubRepo: string;
  githubOwner: string;
  appConfig: AppConfig;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Build model
 */
export interface Build {
  id: string;
  appId: string;
  buildType: BuildType;
  status: BuildStatus;
  bundleIdentifier: string; // May include .dev-build suffix
  easConfig?: any; // Custom EAS configuration for custom builds
  environmentVariables?: EncryptedData;
  ipaUrl?: string;
  buildLogs?: string;
  reviewerId?: string;
  reviewNotes?: string;
  appleReviewData?: AppleReviewData;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Encrypted data structure for environment variables
 */
export interface EncryptedData {
  encryptedValue: string;
  iv: string;
  authTag: string;
}

/**
 * Apple review submission data
 */
export interface AppleReviewData {
  demoCredentials?: {
    username?: string;
    password?: string;
  };
  instructions?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

/**
 * User model
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  githubId?: string;
  githubAccessToken?: string;
  isAdmin?: boolean;
  slackUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Build creation request
 */
export interface CreateBuildRequest {
  appId: string;
  buildType: BuildType;
  easConfig?: any;
  environmentVariables?: Record<string, string>;
  appleReviewData?: AppleReviewData;
}

/**
 * Build review request
 */
export interface ReviewBuildRequest {
  buildId: string;
  approved: boolean;
  notes?: string;
}
