import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRegisterUser, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Loader2, Shield, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  showSetup?: boolean;
}

export default function LoginPage({ showSetup = false }: LoginPageProps) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const registerUser = useRegisterUser();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [formError, setFormError] = useState('');

  const isLoggingIn = loginStatus === 'logging-in';
  const isAuthenticated = !!identity;
  const needsSetup = isAuthenticated && showSetup;

  const handleLogin = () => {
    try {
      login();
    } catch (err: unknown) {
      console.error('Login error:', err);
    }
  };

  const handleSetup = async () => {
    setFormError('');
    if (!name.trim()) return setFormError('Name is required');
    if (!email.trim()) return setFormError('Email is required');
    if (!role) return setFormError('Role is required');
    if (!workspaceId.trim()) return setFormError('Workspace ID is required');

    try {
      await registerUser.mutateAsync({
        email: email.trim(),
        hashedPassword: '',
        role,
        workspaceId: workspaceId.trim().toLowerCase().replace(/\s+/g, '-'),
        name: name.trim(),
      });
      await saveProfile.mutateAsync({
        email: email.trim(),
        role,
        workspaceId: workspaceId.trim().toLowerCase().replace(/\s+/g, '-'),
        name: name.trim(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Setup failed. Please try again.';
      setFormError(msg);
    }
  };

  const isPending = registerUser.isPending || saveProfile.isPending;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/generated/login-splash.dim_1080x1920.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-charcoal-1/85 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm px-6 py-8 flex flex-col items-center gap-6 animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/30 teal-glow">
            <img
              src="/assets/generated/enterprise-logo.dim_256x256.png"
              alt="Enterprise AI Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-gradient-teal">Enterprise AI</h1>
            <p className="text-xs text-muted-foreground mt-1">Multi-Tenant SaaS Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-card/90 backdrop-blur-md border border-border rounded-2xl p-6 shadow-card">
          {!needsSetup ? (
            /* Login View */
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h2 className="font-display font-semibold text-lg text-foreground">Welcome Back</h2>
                <p className="text-xs text-muted-foreground mt-1">Sign in with your Internet Identity</p>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Secure, passwordless authentication powered by Internet Identity
                </p>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full gradient-teal text-charcoal-1 font-semibold rounded-xl h-11 hover:opacity-90 transition-opacity"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* Profile Setup View */
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h2 className="font-display font-semibold text-lg text-foreground">Set Up Your Profile</h2>
                <p className="text-xs text-muted-foreground mt-1">Complete your workspace setup to continue</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-charcoal-4 border-border h-10 text-sm rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="bg-charcoal-4 border-border h-10 text-sm rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-charcoal-4 border-border h-10 text-sm rounded-lg">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-charcoal-3 border-border">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Workspace ID</Label>
                  <Input
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                    placeholder="my-company"
                    className="bg-charcoal-4 border-border h-10 text-sm rounded-lg"
                  />
                  <p className="text-xs text-muted-foreground/70">Unique identifier for your workspace</p>
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-lg p-2.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <Button
                onClick={handleSetup}
                disabled={isPending}
                className="w-full gradient-teal text-charcoal-1 font-semibold rounded-xl h-11 hover:opacity-90 transition-opacity"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/60 text-center">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
