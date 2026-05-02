'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DeadlineEngine } from '@/components/deadline-engine';
import { ExplainabilitySourceBox } from '@/components/explainability-source-box';
import { DirectiveTypeBadge, DirectiveTypeSelector, type DirectiveType } from '@/components/directive-type';
import { ConfidenceScore, RiskLevelBadge } from '@/components/status-badges';
import { Check, X, Edit2, FileText } from 'lucide-react';
import Image from 'next/image';

export default function AIWorkspacePage() {
  const [directiveType, setDirectiveType] = useState<DirectiveType>('compliance');
  const [extracted, setExtracted] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header with Image */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/ai-legal-tech.jpg"
            alt="AI Legal Technology"
            fill
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-[#0047CC]/60" />
        </div>
        <div className="relative z-10 p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">AI Workspace</h2>
          <p className="text-blue-100 text-sm">
            Extract and analyze case directives with AI precision
          </p>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
        {/* Left: PDF Viewer Mock */}
        <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="bg-slate-200 dark:bg-slate-700 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Smith_v_County_2024.pdf</span>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Page 1 of 12</span>
          </div>
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="max-w-2xl">
              <div className="bg-white dark:bg-slate-900 p-8 rounded shadow-sm">
                <h3 className="text-2xl font-bold mb-4 text-foreground">Legal Document Content</h3>
                <p className="text-foreground leading-relaxed mb-4">
                  This is a mock PDF viewer showing the judicial document. In a production environment, 
                  this would display the actual PDF with highlighted directive text and source references.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary p-4 rounded">
                  <p className="font-semibold text-foreground mb-2">Key Directive:</p>
                  <p className="text-sm text-foreground italic">
                    "The defendant shall reinstate the complainant to their former position with full back pay and benefits within thirty (30) days of this order."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Extraction Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex">
            <button className="flex-1 px-4 py-3 text-sm font-medium text-foreground border-b-2 border-primary bg-slate-50 dark:bg-slate-800">
              Extraction
            </button>
            <button className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-foreground">
              History
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {extracted ? (
              <>
                {/* Operational Deadline Engine */}
                <DeadlineEngine
                  complianceDaysRemaining={12}
                  appealDaysRemaining={25}
                  escalationRisk="medium"
                />

                {/* Directive Type */}
                <DirectiveTypeSelector
                  value={directiveType}
                  onChange={setDirectiveType}
                />

                {/* Confidence Score */}
                <div>
                  <ConfidenceScore score={94} />
                </div>

                {/* Risk Level */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Legal Risk</label>
                  <RiskLevelBadge level="medium" />
                </div>

                {/* Extracted Text */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">EXTRACTED DIRECTIVE:</h4>
                  <p className="text-sm text-blue-900 dark:text-blue-300 leading-relaxed italic">
                    "Reinstate the complainant to their former position with full back pay and benefits within thirty (30) days."
                  </p>
                </div>

                {/* Explainability Source Box */}
                <ExplainabilitySourceBox
                  sourcePages={[
                    {
                      page: 3,
                      paragraph: 2,
                      snippet: 'The defendant shall reinstate the complainant to their former position',
                    },
                    {
                      page: 4,
                      paragraph: 1,
                      snippet: 'with full back pay and benefits within thirty (30) days',
                    },
                  ]}
                />

                {/* Metadata */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Responsible Department:</span>
                    <span className="font-medium text-foreground">Human Resources</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Case Number:</span>
                    <span className="font-medium text-foreground">2024-CV-12345</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-slate-600 dark:text-slate-400">Upload or select a case to begin extraction</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-2">
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 gap-2">
                <Check className="w-4 h-4" />
                Approve
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            </div>
            <Button size="sm" variant="destructive" className="w-full">
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
