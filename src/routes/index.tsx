import { createFileRoute } from '@tanstack/react-router';
import { MapView } from '../features/map/components/MapView';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return <MapView />;
}
