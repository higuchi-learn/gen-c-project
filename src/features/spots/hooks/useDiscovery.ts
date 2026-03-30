import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { DiscoveryInsert } from '../../../types';

// スポットの発見状態を管理するカスタムフック
type UseDiscoveryState = {
  isDiscovered: boolean;
  discovering: boolean;
  discover: () => Promise<void>;
};

export function useDiscovery(spotId: string, userId: string | null): UseDiscoveryState {
  const [isDiscovered, setIsDiscovered] = useState(false);
  const [discovering, setDiscovering] = useState(false);

  // ユーザーIDが存在する場合に発見状態をチェック
  useEffect(() => {
    if (!userId) return;
    // 発見状態を確認する関数
    const checkDiscovery = async () => {
      // discoveriesテーブルから該当するレコードを取得
      const { data } = await supabase
        .from('discoveries')
        .select('spot_id')
        .eq('spot_id', spotId)
        .eq('user_id', userId)
        .maybeSingle();

      // データが存在すれば発見済みとする
      setIsDiscovered(!!data);
    };

    void checkDiscovery();
  }, [spotId, userId]);

  const discover = async () => {
    // ユーザーIDがない場合やすでに発見済みの場合、発見処理中の場合は何もしない
    if (!userId || isDiscovered || discovering) return;

    setDiscovering(true);
    // discoveriesテーブルに新しいレコードを挿入して発見を記録
    const payload: DiscoveryInsert = { spot_id: spotId, user_id: userId };
    const { error } = await supabase.from('discoveries').insert(payload);
    // エラーがなければ発見状態を更新
    if (!error) {
      setIsDiscovered(true);
    }
    setDiscovering(false);
  };

  return { isDiscovered, discovering, discover };
}
