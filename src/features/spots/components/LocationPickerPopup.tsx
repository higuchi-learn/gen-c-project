import { Button } from '../../../components/ui/Button';
import styles from './LocationPickerPopup.module.css';

// スポット追加時に必要なpropsの型定義
// onCancelとonConfirmは親コンポーネントから渡されるコールバック関数
// ユーザーが「戻る」または「決定」をクリックしたときに呼び出される
interface LocationPickerPopupProps {
  lat: number;
  lng: number;
  onCancel: () => void;
  onConfirm: () => void;
}

// スポット追加の確認ポップアップコンポーネント
export function LocationPickerPopup({ lat, lng, onCancel, onConfirm }: LocationPickerPopupProps) {
  return (
    <div className={styles.popup}>
      <p className={styles.title}>この場所にスポットを追加する？</p>
      <p className={styles.coords}>
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>
      <div className={styles.buttonRow}>
        <Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
          戻る
        </Button>
        <Button variant="primary" onClick={onConfirm} style={{ flex: 1 }}>
          決定
        </Button>
      </div>
    </div>
  );
}
