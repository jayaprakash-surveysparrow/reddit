import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { SessionWatcher } from '../../auth/SessionWatcher';
import { IconButton } from '../ui/IconButton';
import { LeftSidebar } from './LeftSidebar';
import { Navbar } from './Navbar';

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-canvas">
      <SessionWatcher />
      <Navbar onMenuClick={() => setDrawerOpen((current) => !current)} />

      <div className="mx-auto flex w-full max-w-[1280px] gap-6 px-4 py-4">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-[4.5rem]">
            <LeftSidebar />
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onMouseDown={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-line bg-surface p-3">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="text-sm font-bold text-content">Navigation</span>
              <IconButton icon={X} label="Close navigation menu" onClick={() => setDrawerOpen(false)} />
            </div>
            <LeftSidebar />
          </div>
        </div>
      )}
    </div>
  );
}
