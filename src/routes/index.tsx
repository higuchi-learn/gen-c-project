import { createFileRoute } from '@tanstack/react-router';
import { SpotDetail } from '../features/spots/components/SpotDetail';
export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return <SpotDetail />;
}
