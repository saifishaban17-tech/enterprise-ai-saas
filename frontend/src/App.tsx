import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Leads from './pages/Leads';
import PostScheduler from './pages/PostScheduler';
import AIGenerator from './pages/AIGenerator';
import VisionAnalyzer from './pages/VisionAnalyzer';

// Root route with auth guard
const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}

// Auth wrapper for protected routes
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  return <ProfileGuard>{children}</ProfileGuard>;
}

function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();

  if (isLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <LoginPage showSetup />;
  }

  return <>{children}</>;
}

// Routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <LoginPage />,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: () => (
    <AuthGuard>
      <Layout />
    </AuthGuard>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: Dashboard,
});

const projectsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/projects',
  component: Projects,
});

const leadsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/leads',
  component: Leads,
});

const postSchedulerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/post-scheduler',
  component: PostScheduler,
});

const aiGeneratorRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/ai-generator',
  component: AIGenerator,
});

const visionAnalyzerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/vision-analyzer',
  component: VisionAnalyzer,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    dashboardRoute,
    projectsRoute,
    leadsRoute,
    postSchedulerRoute,
    aiGeneratorRoute,
    visionAnalyzerRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
