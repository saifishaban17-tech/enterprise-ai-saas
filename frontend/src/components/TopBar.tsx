import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TopBar() {
  const { clear, identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-40 bg-charcoal-2/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
          <Zap className="w-4 h-4 text-charcoal-1" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display font-bold text-sm text-foreground leading-none">Enterprise AI</h1>
          {profile && (
            <p className="text-xs text-muted-foreground leading-none mt-0.5 capitalize">
              {profile.role} · {profile.workspaceId}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {profile && (
          <div className="w-7 h-7 rounded-full gradient-teal flex items-center justify-center">
            <span className="text-xs font-bold text-charcoal-1">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {identity && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="w-8 h-8 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
