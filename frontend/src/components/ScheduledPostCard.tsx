import type { ScheduledPost } from '../backend';
import { SiInstagram, SiFacebook, SiLinkedin } from 'react-icons/si';
import { Clock } from 'lucide-react';

interface ScheduledPostCardProps {
  post: ScheduledPost;
}

const platformConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, className: string }> = {
  Instagram: { icon: SiInstagram, className: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
  Facebook: { icon: SiFacebook, className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  LinkedIn: { icon: SiLinkedin, className: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-400/15 text-amber-400 border-amber-400/30' },
  sent: { label: 'Sent', className: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30' },
};

export default function ScheduledPostCard({ post }: ScheduledPostCardProps) {
  const platform = platformConfig[post.platform] || platformConfig.Instagram;
  const status = statusConfig[post.status] || statusConfig.pending;
  const PlatformIcon = platform.icon;

  const scheduledDate = new Date(Number(post.scheduledAt) / 1_000_000);
  const formattedDate = scheduledDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-card border border-border rounded-xl p-4 card-hover animate-fade-in">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium ${platform.className}`}>
          <PlatformIcon className="w-3 h-3" />
          <span>{post.platform}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}>
          {status.label}
        </span>
      </div>
      <p className="text-sm text-foreground line-clamp-2 mb-2">{post.content}</p>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}
