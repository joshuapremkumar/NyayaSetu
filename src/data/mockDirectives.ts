import type { Directive, SourceReference, AIExtractionResult } from '../types';

export const mockDirectives: Directive[] = [
  {
    id: 'dir-001',
    caseId: 'case-001',
    type: 'compliance',
    content: 'The respondent is directed to complete environmental impact assessment and submit compliance report within 30 days of this order.',
    confidenceScore: 94,
    riskLevel: 'high',
    responsibleDepartment: 'Revenue Department',
  },
  {
    id: 'dir-002',
    caseId: 'case-002',
    type: 'reinstatement',
    content: 'Order for immediate reinstatement of the petitioner to their previous position with full back wages.',
    confidenceScore: 88,
    riskLevel: 'medium',
    responsibleDepartment: 'Labor Department',
  },
  {
    id: 'dir-003',
    caseId: 'case-003',
    type: 'compensation',
    content: 'Award of compensation in the amount of Rs. 5,00,000 to the affected parties for damages incurred.',
    confidenceScore: 91,
    riskLevel: 'medium',
    responsibleDepartment: 'Environmental Agency',
  },
  {
    id: 'dir-004',
    caseId: 'case-004',
    type: 'appeal',
    content: 'The appeal against tax assessment order is admitted. Stay granted on recovery proceedings pending disposal.',
    confidenceScore: 96,
    riskLevel: 'high',
    responsibleDepartment: 'Tax Department',
  },
  {
    id: 'dir-005',
    caseId: 'case-001',
    type: 'policy_amendment',
    content: 'Department to amend existing policy guidelines within 60 days to incorporate court observations.',
    confidenceScore: 85,
    riskLevel: 'medium',
    responsibleDepartment: 'Revenue Department',
  },
];

export const mockSourceReferences: SourceReference[] = [
  {
    id: 'src-001',
    directiveId: 'dir-001',
    pageNumber: 12,
    paragraphNumber: 3,
    snippet: '...hereby direct the respondent to complete the environmental impact assessment as mandated under Section 14(2) of the Environmental Protection Act...',
  },
  {
    id: 'src-002',
    directiveId: 'dir-001',
    pageNumber: 14,
    paragraphNumber: 1,
    snippet: '...compliance report shall be submitted to this Court within thirty (30) days from the date of this order...',
  },
  {
    id: 'src-003',
    directiveId: 'dir-002',
    pageNumber: 8,
    paragraphNumber: 5,
    snippet: '...considering the facts and circumstances of the case, we order the immediate reinstatement of the petitioner...',
  },
  {
    id: 'src-004',
    directiveId: 'dir-003',
    pageNumber: 15,
    paragraphNumber: 2,
    snippet: '...in view of the proven damages, compensation of Rupees Five Lakhs is awarded to the affected parties...',
  },
  {
    id: 'src-005',
    directiveId: 'dir-004',
    pageNumber: 6,
    paragraphNumber: 4,
    snippet: '...the appeal is hereby admitted and stay is granted on all recovery proceedings until final disposal...',
  },
];

export const mockExtractionResult: AIExtractionResult = {
  caseId: 'case-001',
  directive: mockDirectives[0],
  deadlines: [
    {
      id: 'deadline-001',
      caseId: 'case-001',
      type: 'compliance',
      dueDate: '2024-03-25',
      daysRemaining: 2,
      urgency: 'critical',
    },
  ],
  sourceReferences: mockSourceReferences.filter((s) => s.directiveId === 'dir-001'),
  processingTime: 2.4,
  model: 'CourtAction AI v2.1',
};

export function getDirectiveByCaseId(caseId: string): Directive | undefined {
  return mockDirectives.find((d) => d.caseId === caseId);
}

export function getDirectivesByCaseId(caseId: string): Directive[] {
  return mockDirectives.filter((d) => d.caseId === caseId);
}

export function getSourceReferencesByDirectiveId(directiveId: string): SourceReference[] {
  return mockSourceReferences.filter((s) => s.directiveId === directiveId);
}
