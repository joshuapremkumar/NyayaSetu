import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth';
import { extractFromPdf } from '@/lib/extraction';

const extractSchema = z.object({
  caseId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(['ADMIN', 'LEGAL_REVIEWER', 'DEPARTMENT_OFFICER'])(user);

    const body = await req.json();
    const { caseId } = extractSchema.parse(body);

    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        uploadedFiles: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!caseItem || !caseItem.uploadedFiles[0]) {
      return NextResponse.json({ error: 'Case or uploaded file not found' }, { status: 400 });
    }

    const fileUrl = caseItem.uploadedFiles[0].blobUrl;
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extraction = await extractFromPdf(buffer);

    await prisma.$transaction(async (tx) => {
      await tx.directive.deleteMany({ where: { caseId } });
      await tx.deadline.deleteMany({ where: { caseId } });

      const directive = await tx.directive.create({
        data: {
          caseId,
          type: extraction.directive.type,
          content: extraction.directive.content,
          confidenceScore: extraction.directive.confidenceScore,
          riskLevel: extraction.directive.riskLevel,
          responsibleDepartment: extraction.directive.responsibleDepartment,
          reviewStatus: 'pending',
        },
      });

      if (extraction.sourceReferences.length > 0) {
        await tx.sourceReference.createMany({
          data: extraction.sourceReferences.map((ref) => ({
            directiveId: directive.id,
            pageNumber: ref.page,
            paragraphNumber: ref.paragraph,
            snippet: ref.snippet,
          })),
        });
      }

      if (extraction.deadlines.length > 0) {
        await tx.deadline.createMany({
          data: extraction.deadlines.map((d) => ({
            caseId,
            type: d.type,
            dueDate: new Date(d.dueDate),
            daysRemaining: d.daysRemaining,
            urgency: d.urgency,
          })),
        });
      }

      await tx.case.update({
        where: { id: caseId },
        data: { status: 'under_review' },
      });

      await tx.auditLog.create({
        data: {
          caseId,
          userId: user.userId,
          action: 'processed',
          notes: 'AI extraction completed',
        },
      });
    });

    return NextResponse.json({
      caseId,
      ...extraction,
    });
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
