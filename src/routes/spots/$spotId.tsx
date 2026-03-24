import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/spots/$spotId')({
  component: SpotDetailPage,
});

function SpotDetailPage() {
  const { spotId } = Route.useParams();
  return <div>スポット詳細: {spotId}（MAP-06）</div>;
}
