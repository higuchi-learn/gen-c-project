import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { AuthProvider } from '../features/auth/AuthContext';
import { Footer } from '../components/layout/Footer';

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
      <Footer />
      <TanStackRouterDevtools />
    </AuthProvider>
  ),
});
