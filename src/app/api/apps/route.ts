import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchAppJsonFromGitHub, validateGitHubRepo } from '@/lib/github';

/**
 * GET /api/apps - List all apps for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // In a real implementation, get userId from session
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const apps = await prisma.app.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(apps);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch apps' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/apps - Create a new app
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { githubOwner, githubRepo } = body;
    
    if (!githubOwner || !githubRepo) {
      return NextResponse.json(
        { error: 'GitHub owner and repo are required' },
        { status: 400 }
      );
    }
    
    // Fetch user's GitHub access token
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user?.githubAccessToken) {
      return NextResponse.json(
        { error: 'GitHub account not linked' },
        { status: 400 }
      );
    }
    
    // Validate repository access
    const hasAccess = await validateGitHubRepo(
      githubOwner,
      githubRepo,
      user.githubAccessToken
    );
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Cannot access GitHub repository' },
        { status: 403 }
      );
    }
    
    // Fetch app.json from the repository
    const appConfig = await fetchAppJsonFromGitHub(
      githubOwner,
      githubRepo,
      user.githubAccessToken
    );
    
    // Create the app
    const app = await prisma.app.create({
      data: {
        userId,
        name: appConfig.name,
        bundleIdentifier: appConfig.bundleIdentifier,
        githubOwner,
        githubRepo,
        appConfig: appConfig as any,
      },
    });
    
    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error('Error creating app:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create app',
      },
      { status: 500 }
    );
  }
}
