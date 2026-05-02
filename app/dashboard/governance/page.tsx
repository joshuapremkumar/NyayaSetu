'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeadlineEngine } from '@/components/deadline-engine';
import { DirectiveTypeBadge } from '@/components/directive-type';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Download, Filter } from 'lucide-react';
import Image from 'next/image';

const departmentRiskData = [
  { department: 'Revenue', overdueDays: 12, count: 3, daysOverdue: 8 },
  { department: 'HR', overdueDays: 8, count: 2, daysOverdue: 5 },
  { department: 'Legal', overdueDays: 3, count: 1, daysOverdue: 2 },
  { department: 'Operations', overdueDays: 15, count: 5, daysOverdue: 10 },
  { department: 'Finance', overdueDays: 6, count: 2, daysOverdue: 3 },
];

const directiveDistribution = [
  { name: 'Compliance', value: 32 },
  { name: 'Appeal', value: 18 },
  { name: 'Reinstatement', value: 12 },
  { name: 'Compensation', value: 15 },
  { name: 'Policy Amendment', value: 8 },
  { name: 'Administrative', value: 10 },
  { name: 'Escalation', value: 5 },
];

const caseAging = [
  { bucket: '0-7d', count: 24 },
  { bucket: '8-14d', count: 18 },
  { bucket: '15-30d', count: 12 },
  { bucket: '30+d', count: 8 },
];

const COLORS = ['#0047CC', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function GovernancePage() {
  return (
    <div className="space-y-6">
      {/* Header with Image */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/courthouse-exterior.jpg"
            alt="Courthouse"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-[#0047CC]/70" />
        </div>
        <div className="relative z-10 p-6 flex justify-between items-center">
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-1">Governance Dashboard</h2>
            <p className="text-blue-100 text-sm">
              Executive oversight and compliance tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Total Pending</p>
          <p className="text-3xl font-bold text-foreground">89</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">↑ 3 from last week</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Critical Deadlines</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">12</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Due within 3 days</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Avg Processing</p>
          <p className="text-3xl font-bold text-foreground">5.2d</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Target: 5 days</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Overdue Directives</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">8</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Requiring action</p>
        </Card>
      </div>

      {/* Critical Alert */}
      <Card className="p-4 border-l-4 border-l-red-600 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-200">Urgent Deadline Actions</h3>
            <p className="text-sm text-red-800 dark:text-red-300 mt-1">
              12 directives due within 3 days across multiple departments. Escalation risk is HIGH for Revenue and Operations departments.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Department Risk Exposure - PRIORITY UPGRADE */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg text-foreground mb-4">Department Risk Exposure</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Department</th>
                    <th className="text-center py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Overdue Directives</th>
                    <th className="text-center py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Days Overdue (Avg)</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentRiskData.map((dept) => (
                    <tr key={dept.department} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-medium text-foreground">{dept.department}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-bold">
                          {dept.count}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-foreground">{dept.daysOverdue}d</td>
                      <td className="py-3 px-3">
                        {dept.count > 3 && <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs font-semibold">HIGH</span>}
                        {dept.count === 2 && <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-semibold">MEDIUM</span>}
                        {dept.count === 1 && <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-semibold">LOW</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Case Aging */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg text-foreground mb-4">Case Aging Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={caseAging}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="bucket" stroke="currentColor" opacity={0.5} />
                <YAxis stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Directive Type Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg text-foreground mb-4">Directive Type Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={directiveDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {directiveDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-xs">
              {directiveDistribution.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <DirectiveTypeBadge type={item.name.toLowerCase().replace(' ', '-') as any} />
                  <span className="ml-auto font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Operational Deadline Summary */}
          <Card className="p-6">
            <DeadlineEngine
              complianceDaysRemaining={8}
              appealDaysRemaining={18}
              escalationRisk="high"
            />
          </Card>
        </div>
      </div>

      {/* Pending Directives Table */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg text-foreground mb-4">Pending Directives</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Case</th>
                <th className="text-left py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Type</th>
                <th className="text-left py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Department</th>
                <th className="text-center py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Days Pending</th>
                <th className="text-center py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Deadline (Days)</th>
                <th className="text-left py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { caseNum: '2024-CV-12345', type: 'reinstatement', dept: 'HR', pending: 5, deadline: 12 },
                { caseNum: '2024-CV-12346', type: 'compensation', dept: 'Revenue', pending: 8, deadline: 3 },
                { caseNum: '2024-CV-12347', type: 'compliance', dept: 'Operations', pending: 12, deadline: 8 },
                { caseNum: '2024-CV-12348', type: 'appeal', dept: 'Legal', pending: 3, deadline: 25 },
              ].map((item) => (
                <tr key={item.caseNum} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-3 font-medium text-foreground">{item.caseNum}</td>
                  <td className="py-3 px-3">
                    <DirectiveTypeBadge type={item.type as any} />
                  </td>
                  <td className="py-3 px-3 text-foreground">{item.dept}</td>
                  <td className="py-3 px-3 text-center font-semibold text-foreground">{item.pending}d</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`font-semibold ${item.deadline <= 3 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {item.deadline}d
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">
                      In Review
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
