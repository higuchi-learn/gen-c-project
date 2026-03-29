import { useNavigate, useLocation } from '@tanstack/react-router';
import { Button } from './Button';

interface LoginRequiredPopupProps {
  featureName: string;
  onBack: () => void;
}

export function LoginRequiredPopup({ featureName, onBack }: LoginRequiredPopupProps) {
  const navigate = useNavigate();
  // ログイン後に戻るパスとして現在のパスを使用する
  const { pathname } = useLocation();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '28px 24px',
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', textAlign: 'center', lineHeight: 1.6 }}>
          {featureName}は
          <br />
          ログインユーザー限定機能です
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={onBack} style={{ flex: 1 }}>
            戻る
          </Button>
          <Button
            variant="primary"
            onClick={() => void navigate({ to: '/login', search: { redirect: pathname } })}
            style={{ flex: 1 }}
          >
            ログイン
          </Button>
        </div>
      </div>
    </div>
  );
}
