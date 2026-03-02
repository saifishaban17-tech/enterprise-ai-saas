import { useGetDashboardStats, useIsCallerAdmin, useGetCallerUserProfile } from '../hooks/useQueries';
import StatCard from '../components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderKanban, Users, CalendarClock, Sparkles, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: profile } = useGetCallerUserProfile();
  const { data: stats, isLoading: statsLoading, error } = useGetDashboardStats();

  const isLoading = adminLoading || statsLoading;

  return (
    <div className="px-4 py-5 space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-xl text-foreground">
          {profile ? `Hello, ${profile.name.split(' ')[0]} 👋` : 'Dashboard'}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {profile?.workspaceId ? `Workspace: ${profile.workspaceId}` : 'Your workspace overview'}
        </p>
      </div>

      {/* Access Denied */}
      {!adminLoading && isAdmin === false && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Admin Access Required</p>
            <p className="text-xs text-muted-foreground mt-1">
              Dashboard statistics are only available to admin users. Contact your workspace admin for access.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && isAdmin && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <p className="text-sm text-destructive">Failed to load dashboard stats. Please try again.</p>
        </div>
      )}

      {/* Stats Grid */}
      {isAdmin && (
        <div className="grid grid-cols-2 gap-3">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl bg-charcoal-3" />
              ))}
            </>
          ) : stats ? (
            <>
              <StatCard
                title="Total Projects"
                value={stats.totalProjects.toString()}
                icon={FolderKanban}
                color="teal"
              />
              <StatCard
                title="Total Leads"
                value={stats.totalLeads.toString()}
                icon={Users}
                color="green"
              />
              <StatCard
                title="Scheduled Posts"
                value={stats.totalScheduledPosts.toString()}
                icon={CalendarClock}
                color="yellow"
              />
              <StatCard
                title="AI Generations"
                value={stats.totalAIGenerations.toString()}
                icon={Sparkles}
                color="purple"
              />
            </>
          ) : null}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-display font-semibold text-sm text-foreground mb-3">Quick Overview</h3>
        <div className="space-y-2">
          {[
            { label: 'Manage your projects', sub: 'Track status and clients', color: 'bg-primary/15 text-primary' },
            { label: 'Capture leads', sub: 'Add new prospects', color: 'bg-emerald-400/15 text-emerald-400' },
            { label: 'Schedule posts', sub: 'Plan social content', color: 'bg-amber-400/15 text-amber-400' },
            { label: 'Generate AI content', sub: 'Powered by AI engine', color: 'bg-violet-400/15 text-violet-400' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <div className={`w-2 h-2 rounded-full ${item.color.split(' ')[0]}`} />
              <div>
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
