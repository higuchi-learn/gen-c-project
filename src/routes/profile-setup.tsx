import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
// ↓ さっき作った画像アップロード用のコンポーネントをインポート
import { AvatarUpload } from '../components/ui/AvaterUpload-setup';

export const Route = createFileRoute('/profile-setup')({
  component: ProfileSetupPage,
});

function ProfileSetupPage() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [residence, setResidence] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // 追加：画像のURL
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 初回レンダリング時に現在のユーザーIDを取得
  useEffect(() => {
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        // Googleログインの場合、Googleの名前を初期値としてセットしてあげる
        if (user.user_metadata?.full_name) {
          setDisplayName(user.user_metadata.full_name as string);
        }
      }
    });
  }, []);

  const handleUpdate = async (e: React.SyntheticEvent) => {
    // フォームのデフォルトの送信動作をキャンセル
    e.preventDefault();
    // ユーザーIDがない場合は処理を中断
    if (!userId) return;
    setLoading(true);

    // usersテーブルを更新 (UPDATE)
    const { error } = await supabase
      .from('users')
      .update({
        username: username,
        display_name: displayName, // 追加：表示名をDBに保存
        residence: residence,
        icon_image: avatarUrl, // 追加：Storageの画像URLをDBに保存
      })
      .eq('id', userId);

    setLoading(false);

    // エラーがあればアラートで表示、なければ成功メッセージを表示してトップページへ遷移
    if (error) {
      alert('エラー: ' + error.message);
    } else {
      alert('プロフィールを登録しました！');
      void navigate({ to: '/' });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', // height から minHeight に変更（要素が増えたため）
        backgroundColor: '#e0f2fe',
        padding: '20px 0',
      }}
    >
      <h1 style={{ fontSize: '28px', marginBottom: '20px', fontWeight: 'bold' }}>プロフィール設定</h1>
      <Card>
        <form onSubmit={(e) => void handleUpdate(e)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* 追加：画像アップロード UI */}
          {userId && <AvatarUpload userId={userId} onUploadComplete={(url) => setAvatarUrl(url)} />}

          <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px', textAlign: 'center' }}>
            アプリで使う情報を登録してください。
          </p>

          <Input
            label="ユーザーネーム (ID) ※必須"
            type="text"
            placeholder="例: taro_sato (重複不可)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {/* 追加：表示名（ニックネーム）の入力欄 */}
          <Input
            label="表示名 (ニックネーム)"
            type="text"
            placeholder="例: 佐藤たろう"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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
