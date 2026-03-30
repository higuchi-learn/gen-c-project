import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useSpotRegistration } from '../hooks/useSpotRegistration';
import { reverseGeocode } from '../../../utils/reverseGeocode';
import styles from './SpotRegistrationForm.module.css';

const SUPABASE_SPOT_IMAGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/spot-images/`;

// バリデーションルール
const spotFormSchema = z.object({
  // スポット名は必須で、1文字以上50文字以内
  name: z.string().min(1, 'スポット名は必須です').max(50, '50文字以内で入力してください'),
  // 説明は任意で、200文字以内
  description: z.string().max(200, '200文字以内で入力してください').optional(),
  // 画像URLは、Supabaseのspot-imagesバケットのURLのみ許可
  image_url: z
    .string()
    .refine((url) => url.startsWith(SUPABASE_SPOT_IMAGE_BASE), '許可されていない画像URLです')
    .nullable()
    .optional(),
});

// スポットの登録に必要なデータの型定義
interface SpotRegistrationFormProps {
  lat: number;
  lng: number;
  userId: string;
}

// スポット登録フォームコンポーネント
export function SpotRegistrationForm({ lat, lng, userId }: SpotRegistrationFormProps) {
  const navigate = useNavigate();
  // useSpotRegistrationカスタムフックからスポット登録関数と状態を取得
  const { registerSpot, loading, error } = useSpotRegistration();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // 逆ジオコーディングで取得した住所（都道府県 + 市区町村）
  const [address, setAddress] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; description?: string; image_url?: string }>({});

  // コンポーネントマウント時に座標から住所を取得する
  useEffect(() => {
    void reverseGeocode(lat, lng).then(setAddress);
  }, [lat, lng]);

  // 画像ファイルが選択されたときの処理
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // 画像サイズが大きすぎる場合は弾く
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('画像サイズが大きすぎます。2MB未満の画像を選択してください。');
      return;
    }

    setUploading(true);
    // ファイル名をユーザーIDとタイムスタンプを組み合わせたものにして一意にする
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    // スポット画像用バケットにファイルをアップロード
    const { error: uploadError } = await supabase.storage.from('spot-images').upload(filePath, file, { upsert: false });

    setUploading(false);

    // アップロードに失敗した場合はエラーメッセージを表示
    if (uploadError) {
      alert('画像のアップロードに失敗しました: ' + uploadError.message);
      return;
    }
    // アップロードに成功したら、画像の公開URLを取得して状態にセット
    const { data } = supabase.storage.from('spot-images').getPublicUrl(filePath);
    setImageUrl(data.publicUrl);
    setPreviewUrl(data.publicUrl);
  };

  // フォームの送信処理
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    // フォームのバリデーションを実行
    const result = spotFormSchema.safeParse({
      name: name.trim(),
      description: description.trim() || undefined,
      image_url: imageUrl,
    });
    // failの場合
    if (!result.success) {
      // バリデーションエラーからフィールドごとのエラーメッセージを抽出
      const fieldErrors = z.flattenError(result.error).fieldErrors;
      // エラーメッセージを状態にセットしてフォームに表示
      setFormErrors({
        name: fieldErrors.name?.[0],
        description: fieldErrors.description?.[0],
        image_url: fieldErrors.image_url?.[0],
      });
      // 処理を中断
      return;
    }
    // successの場合はエラーメッセージをクリア
    setFormErrors({});

    const success = await registerSpot({
      name: name.trim(),
      description: description.trim() || null,
      image_url: imageUrl,
      lat,
      lng,
      // PostGIS geography型として保存（経度が先、緯度が後）
      location: `POINT(${lng} ${lat})`,
      address,
      user_id: userId,
    });

    // 登録に成功したらマップ画面に戻る
    if (success) {
      void navigate({ to: '/' });
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className={styles.form}>
      {/* 画像アップロード */}
      <div className={styles.imageSection}>
        <div className={styles.imagePreview}>
          {previewUrl ? (
            <img src={previewUrl} alt="プレビュー" className={styles.imagePreviewImg} />
          ) : (
            <span className={styles.imagePlaceholder}>画像なし</span>
          )}
        </div>
        <label className={styles.imageUploadLabel}>
          {uploading ? 'アップロード中...' : '画像を選択（任意）'}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void handleImageUpload(e)}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        {formErrors.image_url && <p className={styles.errorText}>{formErrors.image_url}</p>}
      </div>

      <div>
        <Input
          label="スポット名 ※必須"
          type="text"
          placeholder="例: 隠れた桜の木"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {formErrors.name && <p className={styles.errorText}>{formErrors.name}</p>}
      </div>

      {/* 説明 */}
      <div className={styles.descriptionField}>
        <label className={styles.descriptionLabel}>説明（任意）</label>
        <textarea
          className={styles.textarea}
          placeholder="どんなスポットか教えてください"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        {formErrors.description && <p className={styles.errorText}>{formErrors.description}</p>}
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <Button type="submit" disabled={loading || uploading}>
        {loading ? '登録中...' : 'スポットを登録する'}
      </Button>
    </form>
  );
}
