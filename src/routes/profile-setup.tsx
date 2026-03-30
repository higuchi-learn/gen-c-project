import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
// ↓ さっき作った画像アップロード用のコンポーネントをインポート
import { AvatarUpload } from '../components/ui/AvaterUpload-setup';
import { PREFECTURES } from '../constants/prefectures';

// 画像URLのバリデーションで使用するSupabaseのアバター画像のURLのベース部分
const SUPABASE_AVATAR_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/`;

// バリデーションルール
const profileSchema = z.object({
  // ユーザーネームは必須で、1文字以上20文字以内
  username: z.string().min(1, 'ユーザーネームは必須です').max(20, '20文字以内で入力してください'),
  // アイコン画像のURLは、Googleのプロフィール画像かSupabaseのアバター画像のURLであることを確認
  icon_image: z
    .string()
    .refine(
      (url) => url.startsWith('https://lh3.googleusercontent.com/') || url.startsWith(SUPABASE_AVATAR_BASE),
      '許可されていない画像URLです',
    )
    .nullable()
    .optional(),
  // 都道府県リストに含まれない値が入力されえちた場合は拒否する
  residence: z.enum(PREFECTURES, { error: '都道府県リストから選択してください' }).optional(),
});

export const Route = createFileRoute('/profile-setup')({
  component: ProfileSetupPage,
});

function ProfileSetupPage() {
  const [username, setUsername] = useState('');
  const [residence, setResidence] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // 追加：画像のURL
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // 初回レンダリング時に現在のユーザーIDを取得
  useEffect(() => {
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });
  }, []);

  const handleUpdate = async (e: React.SyntheticEvent) => {
    // フォームのデフォルトの送信動作をキャンセル
    e.preventDefault();
    // ユーザーIDがない場合は処理を中断
    if (!userId) return;

    // フォームのバリデーションを実行
    const result = profileSchema.safeParse({
      username: username.trim(),
      icon_image: avatarUrl,
      residence: residence || undefined,
    });
    // failの場合はエラーメッセージを状態にセットして処理を中断
    if (!result.success) {
      // バリデーションエラーからフィールドごとのエラーメッセージを抽出
      const fieldErrors = z.flattenError(result.error).fieldErrors;
      // エラーメッセージを状態にセットしてフォームに表示
      setFormErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ''])));
      return;
    }
    // successの場合はエラーメッセージをクリア
    setFormErrors({});

    setLoading(true);

    // usersテーブルを更新 (UPDATE)
    const { error } = await supabase
      .from('users')
      .update({
        username: username,
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

          <div>
            <Input
              label="ユーザーネーム (ID) ※必須"
              type="text"
              placeholder="例: taro_sato (重複不可)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {formErrors.username && (
              <p style={{ color: '#ef4444', fontSize: '13px', margin: '4px 0 0' }}>{formErrors.username}</p>
            )}
          </div>
          {formErrors.icon_image && (
            <p style={{ color: '#ef4444', fontSize: '13px', margin: '0' }}>{formErrors.icon_image}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>居住地 (任意)</label>
            <select
              value={residence}
              onChange={(e) => setResidence(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                color: residence ? '#111827' : '#9ca3af',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
            {formErrors.residence && (
              <p style={{ color: '#ef4444', fontSize: '13px', margin: '4px 0 0' }}>{formErrors.residence}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? '保存中...' : '確定してはじめる'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
