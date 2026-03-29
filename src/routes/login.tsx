import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
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
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else void navigate({ to: '/' });
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

        <Button type="button" variant="secondary" onClick={() => void navigate({ to: '/register' as any })}>
          新規登録
        </Button>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/reset-password" style={{ fontSize: '13px', color: '#6366f1' }}>
            お忘れですか？
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
