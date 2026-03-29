import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { AuthProvider } from '../features/auth/AuthContext';

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      {/* ここに Header 等の共通レイアウトを置く */}
      <Outlet />
      <TanStackRouterDevtools />
    </AuthProvider>
  ),
});
