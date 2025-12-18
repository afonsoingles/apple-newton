import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reviewBuild } from '@/lib/buildService';
import { ReviewBuildRequest } from '@/types';

/**
 * POST /api/builds/review - Review a build (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body: ReviewBuildRequest = await request.json();
    const { buildId, approved, notes } = body;
    
    if (!buildId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'buildId and approved are required' },
        { status: 400 }
      );
    }
    
    await reviewBuild(buildId, userId, approved, notes);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reviewing build:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to review build',
      },
      { status: 500 }
    );
  }
}
