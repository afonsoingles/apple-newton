import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBuild, reviewBuild } from '@/lib/buildService';
import { BuildType, CreateBuildRequest, ReviewBuildRequest } from '@/types';

/**
 * GET /api/builds - List builds for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    
    const whereClause: any = {
      app: { userId },
    };
    
    if (appId) {
      whereClause.appId = appId;
    }
    
    const builds = await prisma.build.findMany({
      where: whereClause,
      include: {
        app: true,
        review: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(builds);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch builds' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/builds - Create a new build
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body: CreateBuildRequest = await request.json();
    
    // Validate build type
    if (!Object.values(BuildType).includes(body.buildType)) {
      return NextResponse.json(
        { error: 'Invalid build type' },
        { status: 400 }
      );
    }
    
    // Get or generate encryption key for the user
    // In a real implementation, this would be stored securely
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-me';
    
    const build = await createBuild(body, userId, encryptionKey);
    
    return NextResponse.json(build, { status: 201 });
  } catch (error) {
    console.error('Error creating build:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create build',
      },
      { status: 500 }
    );
  }
}
