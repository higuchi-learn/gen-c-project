import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/account/spots')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>"/account/spots"</div>;
}
