import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { supabase } from '../../lib/supabase';

interface AvatarUploadProps {
  userId: string;
  onUploadComplete: (url: string) => void; // アップロード完了時にURLを親に渡す
  initialUrl?: string | null;
}

export const AvatarUpload = ({ userId, onUploadComplete, initialUrl = null }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('画像を選択してください。');
      }

      const file = event.target.files[0];
      // 画像サイズの制限（500KB以下）
      const maxSize = 500 * 1024;
      if (file.size > maxSize) {
        throw new Error('画像サイズが大きすぎます。500KB未満の画像を選択してください。');
      }

      const fileExt = file.name.split('.').pop();
      // ファイル名を「ユーザーID/avatar.拡張子」にする（上書き保存で容量節約）
      const filePath = `${userId}/avatar.${fileExt}`;

      // 1. Supabase Storage にアップロード
      // upsert: true で上書きを許可
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. アップロードした画像のPublic URLを取得
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // キャッシュ対策のためURLにクエリパラメータを付与
      // 詳しくはcache-bustiong.mdを参照
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      // 3. プレビューを表示し、親コンポーネントにURLを渡す
      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('画像のアップロードに失敗しました: ' + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      {/* プレビュー画像またはプレースホルダー */}
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: '#ddd',
          overflow: 'hidden',
          border: '2px solid #fff',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}
          >
            No Image
          </div>
        )}
      </div>

      {/* アップロードボタン（隠したinputを叩くスタイル） */}
      <label
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          padding: '8px 15px',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {uploading ? 'アップロード中...' : '画像を選択'}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => void handleUpload(e)}
          disabled={uploading}
          style={{ display: 'none' }} // input自体は見えなくする
        />
      </label>
    </div>
  );
};
