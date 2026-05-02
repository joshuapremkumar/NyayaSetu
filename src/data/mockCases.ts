import type { Case, Deadline, ReviewerLog } from '../types';

export const mockCases: Case[] = [
  {
    id: 'case-001',
    caseNumber: 'HC-2024-0892',
    court: 'High Court of Karnataka',
    department: 'Revenue Department',
    filingDate: '2024-01-15',
    status: 'pending',
    priority: 'high',
    fileName: 'Smith_v_County_2024.pdf',
    uploadedAt: '2024-03-10T09:30:00Z',
    uploadedBy: 'Sarah Johnson',
  },
  {
    id: 'case-002',
    caseNumber: 'SC-2024-1234',
    court: 'Supreme Court',
    department: 'Labor Department',
    filingDate: '2024-02-01',
    status: 'processing',
    priority: 'high',
    fileName: 'Johnson_Labor_Appeal.pdf',
    uploadedAt: '2024-03-08T14:15:00Z',
    uploadedBy: 'Michael Chen',
  },
  {
    id: 'case-003',
    caseNumber: 'DC-2024-0456',
    court: 'District Court',
    department: 'Environmental Agency',
    filingDate: '2024-02-15',
    status: 'verified',
    priority: 'medium',
    fileName: 'EPA_Compliance_Review.pdf',
    uploadedAt: '2024-03-05T11:00:00Z',
    uploadedBy: 'Emily Davis',
  },
  {
    id: 'case-004',
    caseNumber: 'HC-2024-0789',
    court: 'High Court',
    department: 'Tax Department',
    filingDate: '2024-01-28',
    status: 'pending',
    priority: 'medium',
    fileName: 'Tax_Assessment_Appeal.pdf',
    uploadedAt: '2024-03-12T08:45:00Z',
    uploadedBy: 'Robert Wilson',
  },
  {
    id: 'case-005',
    caseNumber: 'TC-2024-0321',
    court: 'Tribunal Court',
    department: 'Housing Authority',
    filingDate: '2024-03-01',
    status: 'rejected',
    priority: 'low',
    fileName: 'Housing_Dispute_2024.pdf',
    uploadedAt: '2024-03-14T16:20:00Z',
    uploadedBy: 'Lisa Anderson',
  },
];

export const mockDeadlines: Deadline[] = [
  {
    id: 'deadline-001',
    caseId: 'case-001',
    type: 'compliance',
    dueDate: '2024-03-25',
    daysRemaining: 2,
    urgency: 'critical',
  },
  {
    id: 'deadline-002',
    caseId: 'case-001',
    type: 'appeal',
    dueDate: '2024-04-01',
    daysRemaining: 9,
    urgency: 'warning',
  },
  {
    id: 'deadline-003',
    caseId: 'case-002',
    type: 'escalation',
    dueDate: '2024-03-28',
    daysRemaining: 5,
    urgency: 'warning',
  },
  {
    id: 'deadline-004',
    caseId: 'case-004',
    type: 'compliance',
    dueDate: '2024-04-15',
    daysRemaining: 23,
    urgency: 'normal',
  },
];

export const mockReviewerLogs: ReviewerLog[] = [
  {
    id: 'log-001',
    caseId: 'case-001',
    action: 'uploaded',
    userId: 'user-001',
    userName: 'Sarah Johnson',
    timestamp: '2024-03-10T09:30:00Z',
    notes: 'Initial document upload',
  },
  {
    id: 'log-002',
    caseId: 'case-001',
    action: 'processed',
    userId: 'system',
    userName: 'AI System',
    timestamp: '2024-03-10T09:35:00Z',
    notes: 'AI extraction completed with 94% confidence',
  },
  {
    id: 'log-003',
    caseId: 'case-001',
    action: 'reviewed',
    userId: 'user-002',
    userName: 'Michael Chen',
    timestamp: '2024-03-11T14:20:00Z',
    notes: 'Reviewed extraction results',
  },
];

export function getCaseById(id: string): Case | undefined {
  return mockCases.find((c) => c.id === id);
}

export function getDeadlinesByCaseId(caseId: string): Deadline[] {
  return mockDeadlines.filter((d) => d.caseId === caseId);
}

export function getReviewerLogsByCaseId(caseId: string): ReviewerLog[] {
  return mockReviewerLogs.filter((l) => l.caseId === caseId);
}
