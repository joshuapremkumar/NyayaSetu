import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { caseId, action } = req.query;

    const where: Record<string, unknown> = {};

    if (caseId) {
      where.caseId = caseId as string;
    }

    if (action) {
      where.action = action;
    }

    if (req.user!.role === 'DEPARTMENT_OFFICER') {
      where.userId = req.user!.id;
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, role: true } },
        case: { select: { caseNumber: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    res.json({ auditLogs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

router.get('/case/:caseId', authenticate, async (req: AuthRequest, res) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: { caseId: req.params.caseId },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { timestamp: 'desc' },
    });

    res.json({ auditLogs });
  } catch (error) {
    console.error('Get case audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
