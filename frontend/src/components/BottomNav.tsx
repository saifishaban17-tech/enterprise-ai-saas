import { useRouter, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CalendarClock,
  Sparkles,
  ScanEye,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/leads', label: 'Leads', icon: Users },
  { path: '/post-scheduler', label: 'Posts', icon: CalendarClock },
  { path: '/ai-generator', label: 'AI', icon: Sparkles },
  { path: '/vision-analyzer', label: 'Vision', icon: ScanEye },
];

export default function BottomNav() {
  const router = useRouter();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-charcoal-2/95 backdrop-blur-sm border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = currentPath === path;
          return (
            <button
              key={path}
              onClick={() => router.navigate({ to: path })}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-primary/15' : ''
              }`}>
                <Icon
                  className={`w-4 h-4 transition-all duration-200 ${
                    isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'
                  }`}
                />
              </div>
              <span className={`text-[9px] font-medium leading-none transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
