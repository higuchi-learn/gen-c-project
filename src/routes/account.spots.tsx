import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useAuth } from '../features/auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { Spot, SpotUpdate } from '../types';

const SUPABASE_SPOT_IMAGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/spot-images/`;

const spotFormSchema = z.object({
  name: z.string().min(1, 'スポット名は必須です').max(50, '50文字以内で入力してください'),
  description: z.string().max(200, '200文字以内で入力してください').optional(),
  image_url: z
    .string()
    .refine((url) => url.startsWith(SUPABASE_SPOT_IMAGE_BASE), '許可されていない画像URLです')
    .nullable()
    .optional(),
});

export const Route = createFileRoute('/account/spots')({
  component: AccountSpotsPage,
});

function AccountSpotsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchSpots = async () => {
      const { data } = await supabase
        .from('spots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setSpots((data as Spot[]) ?? []);
      setLoading(false);
    };
    void fetchSpots();
  }, [user]);

  if (!user) {
    void navigate({ to: '/account' });
    return null;
  }

  if (editingSpot) {
    return (
      <SpotEditForm
        spot={editingSpot}
        userId={user.id}
        onSave={(updated) => {
          setSpots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          setEditingSpot(null);
        }}
        onDelete={(deletedId) => {
          setSpots((prev) => prev.filter((s) => s.id !== deletedId));
          setEditingSpot(null);
        }}
        onCancel={() => setEditingSpot(null)}
      />
    );
  }

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => void navigate({ to: '/account' })}
          style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827' }}>登録したスポット</h2>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>読み込み中...</p>
      ) : spots.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px' }}>登録したスポットはありません</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px', margin: '0 auto' }}>
          {spots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => setEditingSpot(spot)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              {/* サムネイル */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '10px',
                  backgroundColor: '#e5e7eb',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {spot.image_url ? (
                  <img
                    src={spot.image_url}
                    alt={spot.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>📍</span>
                  </div>
                )}
              </div>
              {/* テキスト */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: '700',
                    fontSize: '15px',
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {spot.name}
                </p>
                {spot.description && (
                  <p
                    style={{
                      margin: '2px 0 0',
                      fontSize: '13px',
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {spot.description}
                  </p>
                )}
              </div>
              <span style={{ color: '#9ca3af', fontSize: '16px', flexShrink: 0 }}>＞</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// スポット編集フォーム
type SpotEditFormProps = {
  spot: Spot;
  userId: string;
  onSave: (updated: Spot) => void;
  onDelete: (spotId: string) => void;
  onCancel: () => void;
};

function SpotEditForm({ spot, userId, onSave, onDelete, onCancel }: SpotEditFormProps) {
  const [name, setName] = useState(spot.name);
  const [description, setDescription] = useState(spot.description ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(spot.image_url ?? null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(spot.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; description?: string; image_url?: string }>({});

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('画像サイズが大きすぎます。2MB未満の画像を選択してください。');
      return;
    }
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('spot-images').upload(filePath, file, { upsert: false });
    setUploading(false);
    if (uploadError) {
      alert('画像のアップロードに失敗しました: ' + uploadError.message);
      return;
    }
    const { data } = supabase.storage.from('spot-images').getPublicUrl(filePath);
    setImageUrl(data.publicUrl);
    setPreviewUrl(data.publicUrl);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const result = spotFormSchema.safeParse({
      name: name.trim(),
      description: description.trim() || undefined,
      image_url: imageUrl,
    });
    if (!result.success) {
      const fieldErrors = z.flattenError(result.error).fieldErrors;
      setFormErrors({
        name: fieldErrors.name?.[0],
        description: fieldErrors.description?.[0],
        image_url: fieldErrors.image_url?.[0],
      });
      return;
    }
    setFormErrors({});
    setSaving(true);
    const payload: SpotUpdate = {
      name: name.trim(),
      description: description.trim() || null,
      image_url: imageUrl,
    };
    const { data, error } = await supabase.from('spots').update(payload).eq('id', spot.id).select().single<Spot>();
    setSaving(false);
    if (error) {
      alert('更新に失敗しました: ' + error.message);
      return;
    }
    if (data) onSave(data);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const { error } = await supabase.from('spots').delete().eq('id', spot.id);
    setDeleting(false);
    if (error) {
      alert('削除に失敗しました: ' + error.message);
      return;
    }
    onDelete(spot.id);
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827' }}>スポットを編集</h2>
      </div>

      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          backgroundColor: '#fff',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 画像アップロード */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '100%',
                height: '160px',
                borderRadius: '12px',
                backgroundColor: '#f0f0f0',
                overflow: 'hidden',
                border: '1px dashed #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="プレビュー" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#aaa', fontSize: '14px' }}>画像なし</span>
              )}
            </div>
            <label
              style={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                padding: '8px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {uploading ? 'アップロード中...' : '画像を変更（任意）'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void handleImageUpload(e)}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            {formErrors.image_url && (
              <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>{formErrors.image_url}</p>
            )}
          </div>

          {/* スポット名 */}
          <div>
            <Input
              label="スポット名 ※必須"
              type="text"
              placeholder="例: 隠れた桜の木"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {formErrors.name && (
              <p style={{ color: '#ef4444', fontSize: '14px', margin: '4px 0 0' }}>{formErrors.name}</p>
            )}
          </div>

          {/* 説明 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>説明（任意）</label>
            <textarea
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px',
                resize: 'none',
                fontFamily: 'inherit',
              }}
              placeholder="どんなスポットか教えてください"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            {formErrors.description && (
              <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>{formErrors.description}</p>
            )}
          </div>

          <Button type="submit" disabled={saving || uploading}>
            {saving ? '保存中...' : '変更を保存する'}
          </Button>
        </form>

        {/* 削除ボタン */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          {confirmDelete ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => void handleDelete()}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {deleting ? '削除中...' : '本当に削除する'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => void handleDelete()}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid #fca5a5',
                backgroundColor: '#fff',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              このスポットを削除する
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
