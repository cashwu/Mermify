import { Outlet, createRootRoute } from '@tanstack/react-router';

import Header from '../components/Header';

export const Route = createRootRoute({
  component: () => (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  ),
});
