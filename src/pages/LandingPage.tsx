import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Shield, Zap, FileText, Lock, BarChart3, Scale, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0047CC] rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">CourtAction AI</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-slate-600 hover:text-foreground transition-colors hidden sm:block">Features</a>
            <a href="#about" className="text-sm text-slate-600 hover:text-foreground transition-colors hidden sm:block">About</a>
            <Link to="/dashboard">
              <Button className="gap-2 bg-[#0047CC] hover:bg-[#003B99]">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Image */}
      <section className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/images/hero-justice.jpg"
            alt="Modern courthouse interior"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0047CC]/20 border border-[#0047CC]/30 text-[#60A5FA] text-sm mb-6">
              <Shield className="w-4 h-4" />
              Governance-Grade AI Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance leading-tight">
              Intelligent Judicial Decision Support
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 text-pretty leading-relaxed">
              Extract, verify, and govern legal directives with AI precision. Meet deadlines, track risk, and ensure compliance—all in one enterprise platform.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 bg-[#0047CC] hover:bg-[#003B99] text-base px-6">
                  Access Platform
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="text-base px-6 border-slate-500 text-white hover:bg-white/10">
                  Explore Features
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-medium">Government Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Audit Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Human-in-the-Loop</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Images */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why CourtAction AI</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Purpose-built for judicial and government operations with institutional-grade features
          </p>
        </div>

        {/* Feature Row 1 - Image Left */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/assets/images/ai-legal-tech.jpg"
              alt="AI-powered legal technology"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0047CC]/10 text-[#0047CC] text-sm font-medium">
              <Zap className="w-4 h-4" />
              Priority Feature
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">Operational Deadline Engine</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Real-time countdown for compliance deadlines, appeal limitations, and escalation risk. Color-coded urgency indicators ensure you never miss critical action dates across your entire case portfolio.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                Compliance due date tracking
              </li>
              <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                Appeal limitation countdowns
              </li>
              <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                Escalation risk alerts
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Row 2 - Image Right */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0047CC]/10 text-[#0047CC] text-sm font-medium">
              <FileText className="w-4 h-4" />
              Governance Grade
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">Explainability Source Box</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Every AI extraction is traced to its source with page numbers, paragraph references, and direct quote snippets. This is not summarization—this is governance-grade transparency.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                Page and paragraph citations
              </li>
              <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                Direct source snippets
              </li>
              <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                Full audit trail
              </li>
            </ul>
          </div>
          <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl lg:order-2">
            <img
              src="/assets/images/gavel-documents.jpg"
              alt="Legal documents and gavel"
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 group">
            <div className="w-14 h-14 bg-[#0047CC]/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#0047CC]/20 transition-colors">
              <Shield className="w-7 h-7 text-[#0047CC]" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Extended Directive Types</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              9 directive classifications including Reinstatement, Compensation, Policy Amendment, and Stay Order for operational precision.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 group">
            <div className="w-14 h-14 bg-[#0047CC]/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#0047CC]/20 transition-colors">
              <BarChart3 className="w-7 h-7 text-[#0047CC]" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Department Risk Exposure</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Executive dashboards showing overdue directives by department. Drive accountability across your organization.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 group">
            <div className="w-14 h-14 bg-[#0047CC]/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#0047CC]/20 transition-colors">
              <Lock className="w-7 h-7 text-[#0047CC]" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Human Verification Layer</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Full audit trail with reviewer notes. AI assists, humans decide. Complete governance transparency.
            </p>
          </Card>
        </div>
      </section>

      {/* About Section with Team Image */}
      <section id="about" className="bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">Built for Legal Excellence</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-6 leading-relaxed">
                CourtAction AI is designed from the ground up for government and judicial operations. Our platform combines cutting-edge AI with rigorous governance standards to deliver a solution that legal professionals can trust.
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                From high courts to administrative tribunals, our platform helps legal teams extract critical information, meet compliance deadlines, and maintain complete audit trails.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-[#0047CC] mb-1">9</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Directive Types</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0047CC] mb-1">100%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Source Traceable</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0047CC] mb-1">Real-time</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Deadline Tracking</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0047CC] mb-1">Full</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Audit Trail</div>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/images/legal-team.jpg"
                alt="Legal team collaboration"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Courthouse Background */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/images/courthouse-exterior.jpg"
            alt="Courthouse exterior"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-[#0047CC]/90" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
            Ready to Transform Your Judicial Process?
          </h2>
          <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
            Start with CourtAction AI today and get institutional-grade decision support for your legal operations.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="gap-2 bg-white text-[#0047CC] hover:bg-blue-50 text-base px-8">
              Access Platform
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0047CC] rounded-xl flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">CourtAction AI</span>
            </div>
            <p className="text-slate-400 text-sm">
              Enterprise Judicial Decision Support Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
