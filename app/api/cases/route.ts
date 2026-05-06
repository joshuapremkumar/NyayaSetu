import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const createCaseSchema = z.object({
  caseNumber: z.string().min(1),
  court: z.string().min(1),
  department: z.string().min(1),
  filingDate: z.string().datetime().or(z.string().date()),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  fileName: z.string().min(1),
  fileUrl: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) where.status = status;
    if (user.role === 'DEPARTMENT_OFFICER' && user.department) {
      where.department = user.department;
    } else if (department) {
      where.department = department;
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          directives: true,
          deadlines: true,
          uploadedBy: { select: { name: true, email: true } },
        },
        orderBy: { uploadedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.case.count({ where }),
    ]);

    return NextResponse.json({
      cases,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { caseNumber, court, department, filingDate, priority, fileName, fileUrl } = createCaseSchema.parse(body);

    const existingCase = await prisma.case.findUnique({
      where: { caseNumber },
    });

    if (existingCase) {
      return NextResponse.json({ error: 'Case number already exists' }, { status: 400 });
    }

    const caseItem = await prisma.case.create({
      data: {
        caseNumber,
        court,
        department,
        filingDate: new Date(filingDate),
        priority: priority || 'medium',
        fileName,
        fileUrl,
        uploadedById: user.userId,
      },
      include: {
        uploadedBy: { select: { name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: caseItem.id,
        userId: user.userId,
        action: 'uploaded',
        notes: `Case ${caseNumber} uploaded`,
      },
    });

    return NextResponse.json({ case: caseItem }, { status: 201 });
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
