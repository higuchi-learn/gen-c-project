import { useState, useEffect } from 'react';

// 位置情報が取得できない場合のフォールバック（東京）
const FALLBACK_POSITION: [number, number] = [35.6895, 139.6917];

// 現在地を取得する時に使う型定義
type GeolocationState = {
  position: [number, number];
  loading: boolean;
};

// 現在地を取得するカスタムフック
export function useGeolocation(): GeolocationState {
  // 位置の状態管理
  const [position, setPosition] = useState<[number, number]>(FALLBACK_POSITION);
  // ローディング状態の管理
  const [loading, setLoading] = useState(true);

  // コンポーネント初回レンダリング時に現在地を取得
  useEffect(() => {
    // Geolocation APIが利用できない場合はローディングを終了
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    // 現在地を取得. 成功, エラー, オプションを指定している
    navigator.geolocation.getCurrentPosition(
      // posにはブラウザから取得した位置情報が入る
      (pos) => {
        // 成功 → 位置情報を状態にセット
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      // エラー
      () => {
        // 権限拒否・タイムアウト・その他エラー → 東京にフォールバック
        setLoading(false);
      },
      // 5秒待っても位置が取得できない場合はエラーとみなす
      { timeout: 5000 },
    );
  }, []);

  return { position, loading };
}
