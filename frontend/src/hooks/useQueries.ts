import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Project, Lead, ScheduledPost, DashboardStats } from '../backend';

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      email: string;
      hashedPassword: string;
      role: string;
      workspaceId: string;
      name: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(
        params.email,
        params.hashedPassword,
        params.role,
        params.workspaceId,
        params.name
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useGetDashboardStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardStats();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// ── Projects ──────────────────────────────────────────────────────────────────

export function useListProjects() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProjects();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; clientId: string; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProject(params.name, params.clientId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export function useListLeads() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listLeads();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useCreateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; phone: string; source: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLead(params.name, params.phone, params.source);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ── Scheduled Posts ───────────────────────────────────────────────────────────

export function useListScheduledPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ScheduledPost[]>({
    queryKey: ['scheduledPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listScheduledPosts();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSchedulePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { platform: string; content: string; scheduledAt: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.schedulePost(params.platform, params.content, params.scheduledAt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ── AI Generator ──────────────────────────────────────────────────────────────

export function useGenerateAIText() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prompt: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateAIText(prompt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ── Vision Analyzer ───────────────────────────────────────────────────────────

export function useAnalyzeImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (base64Image: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.analyzeImage(base64Image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}
