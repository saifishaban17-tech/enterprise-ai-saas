import { Outlet } from '@tanstack/react-router';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
