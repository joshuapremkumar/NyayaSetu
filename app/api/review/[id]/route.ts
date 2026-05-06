import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth';

const reviewSchema = z.object({
  action: z.enum(['approve', 'edit', 'reject']),
  notes: z.string().optional(),
  edits: z.object({
    content: z.string().optional(),
    type: z.string().optional(),
    riskLevel: z.enum(['low', 'medium', 'high']).optional(),
    responsibleDepartment: z.string().optional(),
  }).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    requireRole(['ADMIN', 'LEGAL_REVIEWER'])(user);

    const { id: directiveId } = await params;
    const body = await req.json();
    const { action, notes, edits } = reviewSchema.parse(body);

    const existingDirective = await prisma.directive.findUnique({
      where: { id: directiveId },
    });

    if (!existingDirective) {
      return NextResponse.json({ error: 'Directive not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (action === 'approve') {
      updateData.verified = true;
      updateData.reviewStatus = 'approved';
      updateData.verifiedAt = new Date();
      updateData.verifiedById = user.userId;
      updateData.verificationNotes = notes;
    } else if (action === 'reject') {
      updateData.verified = false;
      updateData.reviewStatus = 'rejected';
      updateData.verificationNotes = notes;
    } else if (action === 'edit') {
      updateData.reviewStatus = 'edited';
      updateData.verificationNotes = notes;
      if (edits) {
        if (edits.content) updateData.content = edits.content;
        if (edits.type) updateData.type = edits.type;
        if (edits.riskLevel) updateData.riskLevel = edits.riskLevel;
        if (edits.responsibleDepartment) updateData.responsibleDepartment = edits.responsibleDepartment;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedDirective = await tx.directive.update({
        where: { id: directiveId },
        data: updateData,
      });

      await tx.reviewLog.create({
        data: {
          caseId: updatedDirective.caseId,
          directiveId: updatedDirective.id,
          reviewerId: user.userId,
          action,
          notes,
          beforeJson: existingDirective as any,
          afterJson: updatedDirective as any,
        },
      });

      await tx.auditLog.create({
        data: {
          caseId: updatedDirective.caseId,
          userId: user.userId,
          action: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'edited',
          notes: notes || `Directive ${action}`,
        },
      });

      const remainingPending = await tx.directive.count({
        where: {
          caseId: updatedDirective.caseId,
          reviewStatus: 'pending',
        },
      });

      if (remainingPending === 0 && action === 'approve') {
        await tx.case.update({
          where: { id: updatedDirective.caseId },
          data: { status: 'approved' },
        });
      }

      return updatedDirective;
    });

    return NextResponse.json({ directive: result });
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
