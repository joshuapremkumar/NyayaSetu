import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const department = user.role === 'DEPARTMENT_OFFICER' ? user.department : undefined;

    const [approvedCases, pendingReviews, criticalDeadlines] = await Promise.all([
      prisma.case.findMany({
        where: {
          ...(department ? { department } : {}),
          status: 'approved',
        },
        include: {
          directives: true,
          deadlines: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      }),
      prisma.directive.count({
        where: {
          ...(department ? { case: { department } } : {}),
          reviewStatus: 'pending',
        },
      }),
      prisma.deadline.count({
        where: {
          ...(department ? { case: { department } } : {}),
          completed: false,
          urgency: 'critical',
        },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        approvedCases: approvedCases.length,
        pendingReviews,
        criticalDeadlines,
      },
      approvedCases,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
