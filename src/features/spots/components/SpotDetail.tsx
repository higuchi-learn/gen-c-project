import React from 'react';
import { Drawer } from 'vaul';
import styles from './SpotDetail.module.css';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import { useSpot } from '../hooks/useSpot';

// マップのマーカーから spotId のみ受け取る
type Props = {
  spotId: string;
  onClose: () => void;
};

export const SpotDetail: React.FC<Props> = ({ spotId, onClose }) => {
  const { spot, loading, error } = useSpot(spotId);

  return (
    <Drawer.Root
      defaultOpen={true}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      snapPoints={[0.4, 1]}
    >
      <Drawer.Portal>
        <Drawer.Content className={styles.bottomSheet}>
          {/* ドラッグハンドル */}
          <div className={styles.buttonArea}>
            <div className={styles.handle} />
          </div>

          {loading && <div className={styles.status}>読み込み中...</div>}
          {error && <div className={styles.status}>エラーが発生しました</div>}

          {spot && (
            <>
              {/* ヘッダー部分 */}
              <div className={styles.header}>
                <h1 className={styles.title}>{spot.name}</h1>
                <button className={styles.closeBtn} onClick={onClose}>
                  <CloseIcon className={styles.iconInfo} />
                </button>
              </div>
              {/* スポットの状態 */}
              <div className={styles.iconsRow}>
                <div className={styles.iconItem}>
                  <DirectionsWalkIcon className={styles.icon} />
                  <div className={styles.iconText}>
                    <span>nkm</span>
                    <span>n分</span>
                  </div>
                </div>
                <div className={styles.iconItem}>
                  <HelpOutlineIcon className={styles.icon} />
                  <span>未訪問</span>
                </div>
              </div>
              {/* 詳細情報 */}
              <div className={styles.info}>
                <div className={styles.row}>
                  <LocationOnIcon className={styles.iconInfo} />
                  <div className={styles.text}>〒012-3456 ◯◯県◯◯市◯◯町◯◯123</div>
                </div>
                <div className={styles.row}>
                  <AccountCircleIcon className={styles.iconInfo} />
                  <div className={styles.text}>{spot.user_id}</div>
                </div>
                <div className={styles.row}>
                  <AssignmentIcon className={styles.iconInfo} />
                  <div className={styles.text}>{spot.description}</div>
                </div>
                {/* 写真関連 */}
                {spot.image_url && (
                  <>
                    <button className={styles.photoButton}>写真を見る</button>
                    <img src={spot.image_url} alt={spot.name} className={styles.img} />
                  </>
                )}
              </div>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
