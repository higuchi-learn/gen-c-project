import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GoogleButton } from '../components/ui/GoogleButton';
import { AuthLayout } from '../features/auth/AuthContext'; // ※あなたの環境のパスに合わせてください

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <AuthLayout title="Sign in">
      <form onSubmit={(e) => void handleLogin(e)}>
        <Input label="メールアドレス" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" style={{ marginBottom: '12px' }}>
          メールでログインする
        </Button>

        {/* ここにGoogleボタンを配置！ */}
        <GoogleButton />

        <div style={{ margin: '20px 0', borderBottom: '1px solid #ddd' }}></div>

        <Link to="/register">
          <Button type="button" variant="secondary">
            新規登録
          </Button>
        </Link>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/reset-password" style={{ fontSize: '13px', color: '#6366f1' }}>
            お忘れですか？
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
