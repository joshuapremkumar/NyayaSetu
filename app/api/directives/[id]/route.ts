import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth';

const updateDirectiveSchema = z.object({
  content: z.string().min(1).optional(),
  type: z.enum(['compliance', 'appeal', 'review', 'reinstatement', 'compensation', 'policy_amendment', 'administrative_action', 'escalation', 'stay_order']).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  responsibleDepartment: z.string().min(1).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const directive = await prisma.directive.findUnique({
      where: { id },
      include: {
        case: { select: { caseNumber: true, department: true, court: true } },
        sourceReferences: true,
      },
    });

    if (!directive) {
      return NextResponse.json({ error: 'Directive not found' }, { status: 404 });
    }

    if (user.role === 'DEPARTMENT_OFFICER' && directive.case.department !== user.department) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ directive });
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
    const updates = updateDirectiveSchema.parse(body);

    const directive = await prisma.directive.update({
      where: { id },
      data: updates,
      include: {
        sourceReferences: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: directive.caseId,
        userId: user.userId,
        action: 'edited',
        notes: 'Directive updated',
      },
    });

    return NextResponse.json({ directive });
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
