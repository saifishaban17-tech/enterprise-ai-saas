import { useState } from 'react';
import { useListScheduledPosts, useSchedulePost, useIsCallerAdmin } from '../hooks/useQueries';
import ScheduledPostCard from '../components/ScheduledPostCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarClock, AlertCircle, Loader2, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { SiInstagram, SiFacebook, SiLinkedin } from 'react-icons/si';

export default function PostScheduler() {
  const { data: posts, isLoading } = useListScheduledPosts();
  const { data: isAdmin } = useIsCallerAdmin();
  const schedulePost = useSchedulePost();

  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState('');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [formError, setFormError] = useState('');

  const handleSchedule = async () => {
    setFormError('');
    if (!platform) return setFormError('Platform is required');
    if (!content.trim()) return setFormError('Content is required');
    if (!scheduledAt) return setFormError('Scheduled date/time is required');

    const scheduledAtMs = new Date(scheduledAt).getTime();
    if (isNaN(scheduledAtMs)) return setFormError('Invalid date/time');

    const scheduledAtNs = BigInt(scheduledAtMs) * BigInt(1_000_000);

    try {
      await schedulePost.mutateAsync({ platform, content: content.trim(), scheduledAt: scheduledAtNs });
      setPlatform('');
      setContent('');
      setScheduledAt('');
      setShowForm(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule post';
      setFormError(msg);
    }
  };

  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">Post Scheduler</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {posts?.length ?? 0} post{posts?.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="gradient-teal text-charcoal-1 font-semibold rounded-xl h-9 px-3"
          >
            {showForm ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            {showForm ? 'Hide' : 'Schedule'}
          </Button>
        )}
      </div>

      {/* Non-admin notice */}
      {isAdmin === false && (
        <div className="bg-charcoal-3 border border-border rounded-xl p-3 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">Only admins can schedule posts. You can view scheduled posts below.</p>
        </div>
      )}

      {/* Schedule Form */}
      {showForm && isAdmin && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-fade-in">
          <h3 className="font-display font-semibold text-sm text-foreground">Compose Post</h3>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-charcoal-4 border-border h-10 text-sm rounded-lg">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent className="bg-charcoal-3 border-border">
                <SelectItem value="Instagram">
                  <div className="flex items-center gap-2">
                    <SiInstagram className="w-3.5 h-3.5 text-pink-400" />
                    Instagram
                  </div>
                </SelectItem>
                <SelectItem value="Facebook">
                  <div className="flex items-center gap-2">
                    <SiFacebook className="w-3.5 h-3.5 text-blue-400" />
                    Facebook
                  </div>
                </SelectItem>
                <SelectItem value="LinkedIn">
                  <div className="flex items-center gap-2">
                    <SiLinkedin className="w-3.5 h-3.5 text-sky-400" />
                    LinkedIn
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              className="bg-charcoal-4 border-border text-sm rounded-lg min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground/60 text-right">{content.length}/500</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Schedule Date & Time</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minDateTime}
              className="bg-charcoal-4 border-border h-10 text-sm rounded-lg"
            />
          </div>

          {formError && (
            <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-lg p-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Button
            onClick={handleSchedule}
            disabled={schedulePost.isPending}
            className="w-full gradient-teal text-charcoal-1 font-semibold rounded-xl h-10"
          >
            {schedulePost.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Schedule Post'
            )}
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-charcoal-3" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!posts || posts.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-3 flex items-center justify-center">
            <CalendarClock className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No posts scheduled</p>
          {isAdmin && (
            <p className="text-xs text-muted-foreground/70">Tap "Schedule" to plan your first post</p>
          )}
        </div>
      )}

      {/* List */}
      {!isLoading && posts && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <ScheduledPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
