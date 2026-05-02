import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, ArrowLeft } from 'lucide-react';

/**
 * Login Page - Placeholder for Lovable Auth Integration
 * This page structure is ready for backend auth wiring
 */
export default function LoginPage() {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: Will be replaced with Lovable auth
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-5"
        style={{
          backgroundImage: 'url(/assets/images/courthouse-exterior.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <Card className="relative z-10 w-full max-w-md p-8">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#0047CC] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#0047CC] rounded-xl flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">CourtAction AI</h1>
            <p className="text-sm text-muted-foreground">Judicial Decision Support</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <Input 
              id="email" 
              type="email" 
              placeholder="admin@judiciary.gov"
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter your password"
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full bg-[#0047CC] hover:bg-[#003399] text-white">
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Government authorized personnel only. All access is logged and monitored.
        </p>
      </Card>
    </div>
  );
}
