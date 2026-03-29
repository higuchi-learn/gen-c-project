import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { SpotInsert } from '../../../types';

// スポット登録用カスタムフック
export function useSpotRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // スポットを登録する関数
  const registerSpot = async (data: SpotInsert): Promise<boolean> => {
    setLoading(true);
    setError(null);
    // 入力内容をSupabaseのspotsテーブルに挿入
    const { error: insertError } = await supabase.from('spots').insert(data);
    setLoading(false);
    // インサートに失敗した場合はエラーメッセージをセット
    if (insertError) {
      setError(insertError.message);
      return false;
    }
    return true;
  };

  return { registerSpot, loading, error };
}
