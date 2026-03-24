import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      {/* ここに Header 等の共通レイアウトを置く */}
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
