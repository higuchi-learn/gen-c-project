import { createFileRoute } from '@tanstack/react-router';
import { Footer } from '../components/layout/Footer';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return <Footer />;
}
