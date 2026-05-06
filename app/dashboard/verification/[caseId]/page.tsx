'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { DeadlineEngine } from '@/components/deadline-engine';
import { ExplainabilitySourceBox } from '@/components/explainability-source-box';
import { DirectiveTypeBadge } from '@/components/directive-type';
import { ConfidenceScore, RiskLevelBadge, StatusBadge } from '@/components/status-badges';
import { Check, X, Edit2, Clock, FileText, User, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function VerificationPage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [directiveId, setDirectiveId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const auditEvents = [
    { timestamp: '2024-01-15 14:22', event: 'Case approved by reviewer', user: 'Judge Sarah Mitchell', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
    { timestamp: '2024-01-15 10:45', event: 'AI extraction completed', user: 'NyayaSetu AI', icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
    { timestamp: '2024-01-15 10:30', event: 'Case uploaded for processing', user: 'Administrator - John Doe', icon: User, color: 'text-slate-600 dark:text-slate-400' },
  ];

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 z-0"><img src="/assets/images/gavel-documents.jpg" alt="Legal documents" className="object-cover w-full h-full opacity-20" /><div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-[#0047CC]/70" /></div>
        <div className="relative z-10 p-6 text-white"><h2 className="text-2xl font-bold mb-1">Verification & Audit</h2><p className="text-blue-100 text-sm">Case: {caseId} | Status: Under Review</p></div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg text-foreground mb-4">Case Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Case Number</p><p className="font-semibold text-foreground">2024-CV-12345</p></div>
              <div><p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Court</p><p className="font-semibold text-foreground">Circuit Court, District 5</p></div>
              <div><p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Directive Type</p><DirectiveTypeBadge type="reinstatement" /></div>
              <div><p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Status</p><StatusBadge status="pending" /></div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-orange-500">
            <h3 className="font-semibold text-lg text-foreground mb-4">Critical Deadlines</h3>
            <DeadlineEngine complianceDaysRemaining={12} appealDaysRemaining={25} escalationRisk="medium" />
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg text-foreground mb-4">Extracted Directive</h3>
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700"><p className="text-sm text-foreground leading-relaxed italic">{`"The defendant shall reinstate the complainant to their former position with full back pay and benefits within thirty (30) days of this order. All seniority rights and benefits shall be restored retroactive to the date of the improper termination."`}</p></div>
              <div className="grid md:grid-cols-3 gap-3">
                <ConfidenceScore score={94} />
                <div><label className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">Legal Risk</label><RiskLevelBadge level="medium" /></div>
                <div><label className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">Responsible Dept</label><div className="text-sm font-semibold text-foreground">Human Resources</div></div>
              </div>
            </div>
          </Card>

          <ExplainabilitySourceBox sourcePages={[{ page: 3, paragraph: 2, snippet: 'The defendant shall reinstate the complainant to their former position with full back pay and benefits' }, { page: 3, paragraph: 3, snippet: 'within thirty (30) days of this order' }, { page: 4, paragraph: 1, snippet: 'All seniority rights and benefits shall be restored retroactive to the date of the improper termination' }]} title="Extraction Source References" />

          <Card className="p-6">
            <h3 className="font-semibold text-lg text-foreground mb-4">Reviewer Notes</h3>
            <Textarea placeholder="Add verification notes, concerns, or clarifications..." value={reviewerNotes} onChange={(e) => setReviewerNotes(e.target.value)} className="min-h-24" />
          </Card>

          <div className="flex gap-3">
            <Button size="lg" className="flex-1 gap-2" onClick={async () => { if (!directiveId) return; await api.patch(`/api/review/${directiveId}`, { action: 'approve', notes: reviewerNotes }); setStatusMessage('Directive approved'); }}><Check className="w-4 h-4" />Approve Directive</Button>
            <Button size="lg" variant="outline" className="flex-1 gap-2" onClick={async () => { if (!directiveId) return; await api.patch(`/api/review/${directiveId}`, { action: 'edit', notes: reviewerNotes }); setStatusMessage('Directive sent for edit'); }}><Edit2 className="w-4 h-4" />Request Edit</Button>
            <Button size="lg" variant="destructive" className="flex-1 gap-2" onClick={async () => { if (!directiveId) return; await api.patch(`/api/review/${directiveId}`, { action: 'reject', notes: reviewerNotes }); setStatusMessage('Directive rejected'); }}><X className="w-4 h-4" />Reject</Button>
          </div>
          <div className="mt-3">
            <input className="w-full border rounded px-3 py-2 text-sm bg-background text-foreground" placeholder="Directive ID for review action" value={directiveId} onChange={(e) => setDirectiveId(e.target.value)} />
            {statusMessage && <p className="text-sm text-green-600 mt-2">{statusMessage}</p>}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2"><Clock className="w-5 h-5" />Audit Trail</h3>
            <div className="space-y-4">
              {auditEvents.map((event, idx) => { const Icon = event.icon; return (<div key={idx} className="flex gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 last:pb-0 last:border-b-0"><Icon className={`w-5 h-5 ${event.color} flex-shrink-0 mt-1`} /><div className="flex-1 min-w-0"><p className="font-medium text-sm text-foreground">{event.event}</p><p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{event.user}</p><p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{event.timestamp}</p></div></div>); })}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-lg text-foreground mb-4">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div><p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Uploaded By</p><p className="text-foreground">Administrator - John Doe</p></div>
              <div><p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Upload Time</p><p className="text-foreground">2024-01-15 10:30 AM</p></div>
              <div><p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Processing Time</p><p className="text-foreground">15 minutes</p></div>
              <div><p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">AI Model Version</p><p className="text-foreground">NyayaSetu AI v2.1</p></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
