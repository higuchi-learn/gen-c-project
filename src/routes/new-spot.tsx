import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../features/auth/AuthContext';
import { SpotLocationPicker } from '../features/spots/components/SpotLocationPicker';
import { SpotRegistrationForm } from '../features/spots/components/SpotRegistrationForm';
import { LoginRequiredPopup } from '../components/ui/LoginRequiredPopup';

export const Route = createFileRoute('/new-spot')({
  component: NewSpotPage,
});

function NewSpotPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 確定した座標を管理する状態（nullのときはマップ選択ステップを表示）
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 未ログインの場合はログイン誘導ポップアップを表示
  if (!user) {
    return <LoginRequiredPopup featureName="スポット登録" onBack={() => void navigate({ to: '/' })} />;
  }

  return (
    <div style={{ height: 'calc(100svh - 80px)', backgroundColor: '#f8fafc', position: 'relative' }}>
      {/* ステップ1: マップで場所を選択 */}
      {!pickedLocation && (
        <SpotLocationPicker onConfirm={(lat, lng) => setPickedLocation({ lat, lng })} />
      )}

      {/* ステップ2: 情報を入力して登録 */}
      {pickedLocation && (
        <div style={{ padding: '20px', maxWidth: '480px', width: '100%', margin: '0 auto' }}>
          <SpotRegistrationForm lat={pickedLocation.lat} lng={pickedLocation.lng} userId={user.id} />
        </div>
      )}
    </div>
  );
}
