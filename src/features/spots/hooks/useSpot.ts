import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Spot } from '../../../types';

// 詳細表示に必要なフィールドのみ取得
type SpotDetail = Pick<Spot, 'id' | 'name' | 'description' | 'image_url' | 'user_id'>;

type UseSpotState = {
  spot: SpotDetail | null;
  loading: boolean;
  error: string | null;
};

export function useSpot(spotId: string): UseSpotState {
  const [spot, setSpot] = useState<SpotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpot = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('spots')
        .select('id, name, description, image_url, user_id')
        .eq('id', spotId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setSpot(data);
      }
      setLoading(false);
    };

    void fetchSpot();
  }, [spotId]);

  return { spot, loading, error };
}
