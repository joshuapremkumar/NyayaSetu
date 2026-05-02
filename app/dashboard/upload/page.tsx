'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Trash2, Eye, Wand2 } from 'lucide-react';
import { StatusBadge } from '@/components/status-badges';
import Link from 'next/link';
import Image from 'next/image';

interface CaseFile {
  id: string;
  filename: string;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  court: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<CaseFile[]>([
    {
      id: '1',
      filename: 'Smith_v_County_2024.pdf',
      uploadedAt: '2024-01-15 09:23',
      status: 'approved',
      court: 'Circuit Court, District 5',
    },
    {
      id: '2',
      filename: 'Johnson_Appeal_Notice.pdf',
      uploadedAt: '2024-01-14 14:15',
      status: 'pending',
      court: 'Appellate Court',
    },
    {
      id: '3',
      filename: 'Administrative_Review_Notice.pdf',
      uploadedAt: '2024-01-13 11:42',
      status: 'processing',
      court: 'Administrative Division',
    },
  ]);

  const handleDelete = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header with Image */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/legal-team.jpg"
            alt="Legal team collaboration"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-[#0047CC]/70" />
        </div>
        <div className="relative z-10 p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">Upload Cases</h2>
          <p className="text-blue-100 text-sm">
            Upload judicial documents for AI extraction and verification
          </p>
        </div>
      </Card>

      {/* Upload Section */}
      <Card className="border-2 border-dashed border-primary/30 p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Legal Documents</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Drag and drop PDF files here or click to browse
          </p>
          <Button>Select Files</Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search by case name or court..."
          className="max-w-xs"
        />
        <select className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-foreground text-sm">
          <option>All Status</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* Recent Files */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-foreground">Recent Uploads</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">File</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Court</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Uploaded</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <span className="font-medium text-foreground">{file.filename}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {file.court}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {file.uploadedAt}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={file.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {file.status === 'pending' && (
                        <Link href={`/dashboard/workspace/${file.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Wand2 className="w-4 h-4" />
                            Process
                          </Button>
                        </Link>
                      )}
                      {file.status !== 'pending' && (
                        <Link href={`/dashboard/verification/${file.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
