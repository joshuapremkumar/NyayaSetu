import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { put } from '@vercel/blob';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const uploadSchema = z.object({
  caseNumber: z.string().min(1),
  court: z.string().min(1),
  department: z.string().min(1),
  filingDate: z.string().datetime().or(z.string().date()),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const caseNumber = formData.get('caseNumber') as string;
    const court = formData.get('court') as string;
    const department = formData.get('department') as string;
    const filingDate = formData.get('filingDate') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validated = uploadSchema.parse({ caseNumber, court, department, filingDate });

    const existingCase = await prisma.case.findUnique({
      where: { caseNumber: validated.caseNumber },
    });

    if (existingCase) {
      return NextResponse.json({ error: 'Case number already exists' }, { status: 400 });
    }

    const blob = await put(`cases/${Date.now()}-${file.name}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/pdf',
      addRandomSuffix: true,
    });

    const caseItem = await prisma.$transaction(async (tx) => {
      const newCase = await tx.case.create({
        data: {
          caseNumber: validated.caseNumber,
          court: validated.court,
          department: validated.department,
          filingDate: new Date(validated.filingDate),
          fileName: file.name,
          fileUrl: blob.url,
          uploadedById: user.userId,
          status: 'pending',
        },
        include: {
          uploadedBy: { select: { name: true, email: true } },
        },
      });

      await tx.uploadedFile.create({
        data: {
          caseId: newCase.id,
          blobUrl: blob.url,
          blobKey: blob.pathname,
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          sizeBytes: file.size,
          uploadedById: user.userId,
        },
      });

      await tx.auditLog.create({
        data: {
          caseId: newCase.id,
          userId: user.userId,
          action: 'uploaded',
          notes: `File uploaded: ${file.name}`,
        },
      });

      return newCase;
    });

    return NextResponse.json(
      {
        caseId: caseItem.id,
        blobUrl: blob.url,
        status: caseItem.status,
        case: caseItem,
      },
      { status: 201 }
    );
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
