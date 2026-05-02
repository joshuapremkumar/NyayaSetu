'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FileUp, Wand2, CheckCircle, AlertCircle } from 'lucide-react';
import { StatusBadge } from '@/components/status-badges';
import { DirectiveTypeBadge } from '@/components/directive-type';

export default function DashboardPage() {
  const recentCases = [
    {
      id: '1',
      caseNumber: '2024-CV-12345',
      filename: 'Smith_v_County_2024.pdf',
      court: 'Circuit Court, District 5',
      status: 'approved' as const,
      uploadedAt: '2 hours ago',
      directive: 'Reinstatement',
    },
    {
      id: '2',
      caseNumber: '2024-CV-12346',
      filename: 'Johnson_Appeal_Notice.pdf',
      court: 'Appellate Court',
      status: 'pending' as const,
      uploadedAt: '5 hours ago',
      directive: 'Appeal',
    },
    {
      id: '3',
      caseNumber: '2024-CV-12347',
      filename: 'Admin_Review_Action.pdf',
      court: 'Administrative Division',
      status: 'processing' as const,
      uploadedAt: '1 day ago',
      directive: 'Compensation',
    },
  ];

  const upcomingDeadlines = [
    { caseNumber: '2024-CV-12346', daysRemaining: 3, directive: 'Appeal', urgency: 'critical' as const },
    { caseNumber: '2024-CV-12348', daysRemaining: 5, directive: 'Compliance', urgency: 'warning' as const },
    { caseNumber: '2024-CV-12349', daysRemaining: 8, directive: 'Review', urgency: 'normal' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Image */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/scales-justice.jpg"
            alt="Scales of justice"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0047CC]/90 to-[#0047CC]/70" />
        </div>
        <div className="relative z-10 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-blue-100 max-w-xl">
            Your judicial case management overview. Track deadlines, verify extractions, and ensure governance compliance.
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link href="/dashboard/upload">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileUp className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h3 className="font-semibold text-foreground">Upload Case</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Add new documents</p>
          </Card>
        </Link>

        <Link href="/dashboard/workspace">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="font-semibold text-foreground">AI Workspace</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Extract directives</p>
          </Card>
        </Link>

        <Link href="/dashboard/verification">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="font-semibold text-foreground">Verify Cases</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Review extractions</p>
          </Card>
        </Link>

        <Link href="/dashboard/governance">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="font-semibold text-foreground">Governance</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">View metrics</p>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="space-y-4">
          <Card className="p-6">
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Total Cases</p>
            <p className="text-4xl font-bold text-foreground">89</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 12 this week</p>
          </Card>

          <Card className="p-6">
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Processed Today</p>
            <p className="text-4xl font-bold text-foreground">7</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Average: 5 per day</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-900/10">
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Critical Deadlines</p>
            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">3</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Action required</p>
          </Card>
        </div>

        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-foreground">Recent Cases</h3>
              <Link href="/dashboard/upload">
                <Button size="sm" variant="outline" className="gap-2">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Case Number</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Court</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCases.map((caseItem) => (
                    <tr key={caseItem.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-medium text-primary">{caseItem.caseNumber}</td>
                      <td className="py-3 px-4">
                        <DirectiveTypeBadge type={caseItem.directive.toLowerCase() as any} />
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">{caseItem.court}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={caseItem.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">{caseItem.uploadedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          Upcoming Critical Deadlines
        </h3>
        <div className="space-y-3">
          {upcomingDeadlines.map((deadline, idx) => {
            const bgColor = deadline.urgency === 'critical' 
              ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-600'
              : deadline.urgency === 'warning'
              ? 'bg-orange-50 dark:bg-orange-900/10 border-l-4 border-l-orange-600'
              : 'bg-slate-50 dark:bg-slate-800/50 border-l-4 border-l-slate-400';
            
            return (
              <div key={idx} className={`p-4 rounded-lg ${bgColor}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{deadline.caseNumber}</p>
                    <DirectiveTypeBadge type={deadline.directive.toLowerCase() as any} className="mt-2" />
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      deadline.urgency === 'critical' ? 'text-red-600 dark:text-red-400' :
                      deadline.urgency === 'warning' ? 'text-orange-600 dark:text-orange-400' :
                      'text-slate-600 dark:text-slate-400'
                    }`}>
                      {deadline.daysRemaining} days
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">remaining</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
