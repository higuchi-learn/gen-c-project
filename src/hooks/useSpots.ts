import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Spot } from '../types';

// Spotテーブルから必要なフィールドだけを抜き取った型
type SpotMarker = Pick<Spot, 'id' | 'name' | 'description' | 'lat' | 'lng'>;

export function useSpots() {
  // スポット一覧を格納する状態
  const [spots, setSpots] = useState<SpotMarker[]>([]);
  // データ取得中かを示す状態
  const [loading, setLoading] = useState(true);
  // エラーメッセージを格納する状態
  const [error, setError] = useState<string | null>(null);

  // 初回レンダリング時に実行する処理
  useEffect(() => {
    // Supabaseからスポットデータを取得する非同期関数
    const fetchSpots = async () => {
      const { data, error } = await supabase.from('spots').select('id, name, description, lat, lng');
      // エラーがあればエラーメッセージをセットし、そうでなければスポットデータをセットする
      if (error) {
        setError(error.message);
      } else {
        setSpots((data as SpotMarker[] | null) ?? []);
      }
      // データの取得が完了したら, ローディング状態をfalseにする
      setLoading(false);
    };
    // 定義した関数の実行
    void fetchSpots();
  }, []);

  return { spots, loading, error };
}
