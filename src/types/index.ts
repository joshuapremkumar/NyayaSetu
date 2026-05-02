// Core Case Types
export type CaseStatus = 'pending' | 'processing' | 'verified' | 'rejected';
export type CasePriority = 'high' | 'medium' | 'low';

export interface Case {
  id: string;
  caseNumber: string;
  court: string;
  department: string;
  filingDate: string;
  status: CaseStatus;
  priority: CasePriority;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
}

// Directive Types - Extended Taxonomy
export type DirectiveType =
  | 'compliance'
  | 'appeal'
  | 'review'
  | 'reinstatement'
  | 'compensation'
  | 'policy_amendment'
  | 'administrative_action'
  | 'escalation'
  | 'stay_order';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Directive {
  id: string;
  caseId: string;
  type: DirectiveType;
  content: string;
  confidenceScore: number;
  riskLevel: RiskLevel;
  responsibleDepartment: string;
}

// Deadline Engine Types
export type DeadlineType = 'compliance' | 'appeal' | 'escalation';
export type DeadlineUrgency = 'critical' | 'warning' | 'normal';

export interface Deadline {
  id: string;
  caseId: string;
  type: DeadlineType;
  dueDate: string;
  daysRemaining: number;
  urgency: DeadlineUrgency;
}

// Explainability Source Types
export interface SourceReference {
  id: string;
  directiveId: string;
  pageNumber: number;
  paragraphNumber: number;
  snippet: string;
  highlightStart?: number;
  highlightEnd?: number;
}

// Audit Trail Types
export type ReviewAction = 'uploaded' | 'processed' | 'reviewed' | 'approved' | 'rejected' | 'edited';

export interface ReviewerLog {
  id: string;
  caseId: string;
  action: ReviewAction;
  userId: string;
  userName: string;
  timestamp: string;
  notes?: string;
}

// Department Risk Exposure Types
export type DepartmentRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Department {
  id: string;
  name: string;
  overdueCount: number;
  totalCases: number;
  avgDaysOverdue: number;
  riskLevel: DepartmentRiskLevel;
}

// Governance Analytics Types
export interface GovernanceMetrics {
  pendingCompliance: number;
  upcomingDeadlines: number;
  appealQueue: number;
  avgProcessingTime: number;
  criticalAlerts: number;
}

// Upload Types
export interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

// AI Extraction Result Types
export interface AIExtractionResult {
  caseId: string;
  directive: Directive;
  deadlines: Deadline[];
  sourceReferences: SourceReference[];
  processingTime: number;
  model: string;
}
