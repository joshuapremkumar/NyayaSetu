import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth';

const updateCaseSchema = z.object({
  status: z.enum(['pending', 'processing', 'verified', 'rejected', 'extracted', 'under_review', 'approved']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: {
        directives: { include: { sourceReferences: true } },
        deadlines: true,
        auditLogs: {
          include: { user: { select: { name: true, email: true } } },
          orderBy: { timestamp: 'desc' },
        },
        uploadedBy: { select: { name: true, email: true } },
      },
    });

    if (!caseItem) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (user.role === 'DEPARTMENT_OFFICER' && caseItem.department !== user.department) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ case: caseItem });
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    requireRole(['ADMIN', 'LEGAL_REVIEWER'])(user);

    const { id } = await params;
    const body = await req.json();
    const { status, priority } = updateCaseSchema.parse(body);

    const caseItem = await prisma.case.findUnique({
      where: { id },
    });

    if (!caseItem) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
      },
      include: {
        uploadedBy: { select: { name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: id,
        userId: user.userId,
        action: status === 'verified' ? 'approved' : status === 'rejected' ? 'rejected' : 'edited',
        notes: `Case status changed to ${status}`,
      },
    });

    return NextResponse.json({ case: updatedCase });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    requireRole(['ADMIN'])(user);

    const { id } = await params;
    const caseItem = await prisma.case.findUnique({
      where: { id },
    });

    if (!caseItem) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    await prisma.case.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Case deleted successfully' });
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
