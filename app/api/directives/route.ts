import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth';

const createDirectiveSchema = z.object({
  caseId: z.string().uuid(),
  type: z.enum(['compliance', 'appeal', 'review', 'reinstatement', 'compensation', 'policy_amendment', 'administrative_action', 'escalation', 'stay_order']),
  content: z.string().min(1),
  confidenceScore: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high']),
  responsibleDepartment: z.string().min(1),
  sourceReferences: z.array(z.object({
    page: z.number(),
    paragraph: z.number(),
    snippet: z.string(),
  })).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');
    const type = searchParams.get('type');
    const verified = searchParams.get('verified');

    const where: any = {};
    if (caseId) where.caseId = caseId;
    if (type) where.type = type;
    if (verified !== null) where.verified = verified === 'true';

    const directives = await prisma.directive.findMany({
      where,
      include: {
        case: { select: { caseNumber: true, department: true } },
        sourceReferences: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = user.role === 'DEPARTMENT_OFFICER'
      ? directives.filter((d) => d.case.department === user.department)
      : directives;

    return NextResponse.json({ directives: filtered });
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

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(['ADMIN', 'LEGAL_REVIEWER'])(user);

    const body = await req.json();
    const { caseId, type, content, confidenceScore, riskLevel, responsibleDepartment, sourceReferences } = createDirectiveSchema.parse(body);

    const directive = await prisma.directive.create({
      data: {
        caseId,
        type,
        content,
        confidenceScore,
        riskLevel,
        responsibleDepartment,
        sourceReferences: sourceReferences
          ? {
              create: sourceReferences.map((ref) => ({
                pageNumber: ref.page,
                paragraphNumber: ref.paragraph,
                snippet: ref.snippet,
              })),
            }
          : undefined,
      },
      include: {
        sourceReferences: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId,
        userId: user.userId,
        action: 'processed',
        notes: `Directive extracted with ${confidenceScore}% confidence`,
      },
    });

    return NextResponse.json({ directive }, { status: 201 });
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
