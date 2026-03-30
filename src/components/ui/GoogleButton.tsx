import { supabase } from '../../lib/supabase';
import { Button } from './Button';

export const GoogleButton = () => {
  const handleGoogleLogin = async () => {
    // ログイン後にリダイレクトさせたいパスがあればセッションストレージに保存しておく
    const redirectPath = new URLSearchParams(window.location.search).get('redirect');
    if (redirectPath) sessionStorage.setItem('postLoginRedirect', redirectPath);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // ログイン成功後にプロフィール設定画面へ飛ばす
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      alert('Googleログインに失敗しました: ' + error.message);
    }
  };

  return (
    <Button
      type="button"
      onClick={() => void handleGoogleLogin()}
      style={{
        backgroundColor: '#fff',
        color: '#757575',
        border: '1px solid #ddd',
        marginTop: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px', height: '18px' }} />
      Googleでログイン
    </Button>
  );
};
