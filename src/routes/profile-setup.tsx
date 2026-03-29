import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Route = createFileRoute('/src/routes/profile-setup')({
  component: ProfileSetupPage,
});

function ProfileSetupPage() {
  const [username, setUsername] = useState('');
  const [residence, setResidence] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 画面が開いたときに現在のユーザーIDを取得
  useEffect(() => {
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);

    // usersテーブルを更新 (UPDATE)
    const { error } = await supabase
      .from('users')
      .update({
        username: username,
        residence: residence,
      })
      .eq('id', userId);

    setLoading(false);

    if (error) {
      alert('エラー: ' + error.message);
    } else {
      alert('プロフィールを登録しました！');
      void navigate({ to: '/' }); // メイン画面（地図）へ
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#e0f2fe',
      }}
    >
      <h1 style={{ fontSize: '28px', marginBottom: '20px', fontWeight: 'bold' }}>プロフィール設定</h1>
      <Card>
        <form onSubmit={(e) => void handleUpdate(e)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
            アプリで使うユーザーネームを登録してください。
          </p>

          <Input
            label="ユーザーネーム (必須)"
            type="text"
            placeholder="例: たろう"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="居住地 (任意)"
            type="text"
            placeholder="例: 東京都"
            value={residence}
            onChange={(e) => setResidence(e.target.value)}
          />

          <Button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? '保存中...' : '確定してはじめる'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
