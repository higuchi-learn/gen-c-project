import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthLayout } from '../features/auth/AuthContext';

export const Route = createFileRoute('/reset-password' as any)({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false); // メール送信済みかどうかのフラグ
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // ユーザーがメールのリンクをクリックした後に飛ばす先のURL
      // 開発中は localhost、本番はサイトのURLになります
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      alert('エラー: ' + error.message);
    } else {
      setIsSent(true);
    }
    setLoading(false);
  };

  return (
    <AuthLayout title="再設定">
      {!isSent ? (
        // 送信前のフォーム
        <form onSubmit={(e) => void handleResetPassword(e)}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px', textAlign: 'center' }}>
            登録済みのメールアドレスを入力してください。
          </p>

          <Input
            label="メールアドレス"
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button type="submit" disabled={loading}>
              {loading ? '送信中...' : '再設定メールを送る'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => void navigate({ to: '/login', search: { redirect: undefined } })}
            >
              キャンセル
            </Button>
          </div>
        </form>
      ) : (
        // 送信後のメッセージ
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '15px', color: '#333', marginBottom: '20px' }}>
            メールを送信しました！
            <br />
            届いたメール内のリンクをクリックしてパスワードを変更してください。
          </p>
          <Button type="button" onClick={() => void navigate({ to: '/login', search: { redirect: undefined } })}>
            ログイン画面に戻る
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
