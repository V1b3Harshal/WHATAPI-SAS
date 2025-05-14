'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight } from 'lucide-react'; 

export default function OnboardingPage() {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Enable client-side rendering for animated particles
  useEffect(() => {
    setMounted(true);
  }, []);

  // Session check to ensure user is logged in and not already onboarded
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        });
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.onboarded) {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Session check error:', err);
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!agreed) {
      setError('Please agree to the terms to continue');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/onboarded', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Onboarding failed');
      }
      // Force full page reload to refresh middleware state
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Logout failed');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden border border-border/50 bg-background/80 backdrop-blur-lg">
          {/* Glassmorphism effect elements */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-violet-600/20 blur-xl" />
          
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Let’s complete your onboarding process.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 rounded border border-border text-primary focus:ring-primary/50"
                  disabled={loading}
                />
                <label htmlFor="agree" className="text-sm text-muted-foreground">
                  I agree to the terms and conditions
                </label>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing Onboarding...
                  </>
                ) : (
                  <>
                    Complete Onboarding
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="w-full bg-gray-200 text-black hover:bg-gray-300"
              >
                Sign Out
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative flex w-full items-center justify-center">
              <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
              <span className="relative bg-background px-2 text-sm text-muted-foreground">
                or
              </span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ConnectAPI All rights reserved.
      </div>
    </div>
  );
}