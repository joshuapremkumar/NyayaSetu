import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole, type AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

const createCaseSchema = z.object({
  caseNumber: z.string().min(1),
  court: z.string().min(1),
  department: z.string().min(1),
  filingDate: z.string().datetime().or(z.string().date()),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  fileName: z.string().min(1),
  fileUrl: z.string().optional(),
});

const updateCaseSchema = z.object({
  status: z.enum(['pending', 'processing', 'verified', 'rejected']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, department, page = '1', limit = '20' } = req.query;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (req.user!.role === 'DEPARTMENT_OFFICER' && req.user!.department) {
      where.department = req.user!.department;
    } else if (department) {
      where.department = department;
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          uploadedBy: {
            select: { name: true, email: true },
          },
          _count: {
            select: { directives: true, deadlines: true },
          },
        },
        orderBy: { uploadedAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      }),
      prisma.case.count({ where }),
    ]);

    res.json({
      cases,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const caseItem = await prisma.case.findUnique({
      where: { id: req.params.id },
      include: {
        uploadedBy: {
          select: { name: true, email: true },
        },
        directives: {
          include: {
            sourceReferences: true,
          },
        },
        deadlines: true,
        auditLogs: {
          include: {
            user: { select: { name: true, email: true } },
          },
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (req.user!.role === 'DEPARTMENT_OFFICER' && caseItem.department !== req.user!.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ case: caseItem });
  } catch (error) {
    console.error('Get case error:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

router.post('/', authenticate, requireRole('ADMIN', 'LEGAL_REVIEWER', 'DEPARTMENT_OFFICER'), async (req: AuthRequest, res) => {
  try {
    const { caseNumber, court, department, filingDate, priority, fileName, fileUrl } = createCaseSchema.parse(req.body);

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
        fileName,
        fileUrl,
        uploadedById: req.user!.id,
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
        notes: `Case ${caseNumber} uploaded`,
        ipAddress: req.ip,
      },
    });

    res.status(201).json({ case: caseItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create case error:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

router.patch('/:id', authenticate, requireRole('ADMIN', 'LEGAL_REVIEWER'), async (req: AuthRequest, res) => {
  try {
    const { status, priority } = updateCaseSchema.parse(req.body);

    const caseItem = await prisma.case.findUnique({
      where: { id: req.params.id },
    });

    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const updatedCase = await prisma.case.update({
      where: { id: req.params.id },
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
        caseId: caseItem.id,
        userId: req.user!.id,
        action: status === 'verified' ? 'approved' : status === 'rejected' ? 'rejected' : 'edited',
        notes: `Case status changed to ${status}`,
        ipAddress: req.ip,
      },
    });

    res.json({ case: updatedCase });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update case error:', error);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const caseItem = await prisma.case.findUnique({
      where: { id: req.params.id },
    });

    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    await prisma.case.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

export default router;
