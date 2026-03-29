import { supabase } from '../../lib/supabase';
import { useNavigate } from '@tanstack/react-router';
import { Button } from './Button';

export const LogoutButton = () => {
  const navigate = useNavigate();

  const onLogout = async () => {
    const confirmLogout = window.confirm('ログアウトしますか？');
    if (!confirmLogout) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert('エラーが発生しました: ' + error.message);
    } else {
      // ログアウト成功後、まっぷ移動
      void navigate({ to: '/' });
    }
  };

  return (
    <Button onClick={() => void onLogout()} variant="secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
      ログアウト
    </Button>
  );
};
