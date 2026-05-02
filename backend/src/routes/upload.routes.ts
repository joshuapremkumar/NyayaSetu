import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

const createCaseFromUploadSchema = z.object({
  caseNumber: z.string().min(1),
  court: z.string().min(1),
  department: z.string().min(1),
  filingDate: z.string().datetime().or(z.string().date()),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});

router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { caseNumber, court, department, filingDate, priority } = createCaseFromUploadSchema.parse(req.body);

    const existingCase = await prisma.case.findUnique({
      where: { caseNumber },
    });

    if (existingCase) {
      return res.status(400).json({ error: 'Case number already exists' });
    }

    const caseItem = await prisma.case.create({
      data: {
        caseNumber,
        court,
        department,
        filingDate: new Date(filingDate),
        priority: priority || 'medium',
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        uploadedById: req.user!.id,
        status: 'pending',
      },
      include: {
        uploadedBy: { select: { name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: caseItem.id,
        userId: req.user!.id,
        action: 'uploaded',
        notes: `File uploaded: ${req.file.originalname}`,
        ipAddress: req.ip,
      },
    });

    res.status(201).json({
      case: caseItem,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: caseItem.fileUrl,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
