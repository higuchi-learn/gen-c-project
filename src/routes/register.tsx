import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthLayout } from '../features/auth/AuthContext';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Supabaseで新規ユーザー登録
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert('登録エラー: ' + error.message);
    } else {
      // 登録成功（通常は確認メールが飛びます）
      if (data.user && data.session === null) {
        alert('確認メールを送信しました！メール内のリンクをクリックして登録を完了してください。');
      } else {
        alert('登録が完了しました！');
      }
      void navigate({ to: '/login' });
    }
    setLoading(false);
  };

  return (
    <AuthLayout title="新規登録">
      <form onSubmit={(e) => void handleSignUp(e)}>
        <Input
          label="メールアドレス"
          type="email"
          placeholder="example@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="パスワード"
          type="password"
          placeholder="6文字以上"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* デザイン案に合わせ、新規登録はシアン（secondary）にします */}
          <Button type="submit" variant="secondary" disabled={loading}>
            {loading ? '登録中...' : 'アカウントを作成する'}
          </Button>

          <Button type="button" variant="primary" onClick={() => void navigate({ to: '/login' })}>
            ログイン画面に戻る
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
