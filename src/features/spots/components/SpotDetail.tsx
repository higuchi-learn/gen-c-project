import React from 'react';
import { Drawer } from 'vaul';
import styles from './SpotDetail.module.css';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import { useSpot } from '../hooks/useSpot';
import { useDiscovery } from '../hooks/useDiscovery';
import { useAuth } from '../../auth/AuthContext';

export type DiscoveryPopupType = 'login' | 'confirm' | 'alreadyDiscovered';

type Props = {
  spotId: string;
  onClose: () => void;
  // 発見関連のポップアップを表示するためのコールバック関数
  onShowDiscoveryPopup: (type: DiscoveryPopupType, discover?: () => Promise<void>) => void;
  // ドロワー内でポップアップが開いているかどう
  // ポップアップが開いている場合はドロワーの外側をクリックしても閉じないようにする
  isPopupOpen?: boolean;
};

export const SpotDetail: React.FC<Props> = ({ spotId, onClose, onShowDiscoveryPopup, isPopupOpen = false }) => {
  const { spot, loading, error } = useSpot(spotId);
  const { user } = useAuth();
  const { isDiscovered, discover } = useDiscovery(spotId, user?.id ?? null);

  return (
    <Drawer.Root
      open={true}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      snapPoints={[0.4, 1]}
    >
      <Drawer.Portal>
        <Drawer.Content
          className={styles.bottomSheet}
          // ポップアップが開いている場合はドロワーの外側をクリックしても閉じないようにする
          onPointerDownOutside={(e) => {
            if (isPopupOpen) e.preventDefault();
          }}
        >
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
                <button
                  className={styles.discoveryIconBtn}
                  onClick={() => {
                    // ユーザーがログインしていない場合はログインを促すポップアップを表示
                    if (!user) {
                      onShowDiscoveryPopup('login');
                      // すでに発見済みの場合はその旨を伝えるポップアップを表示
                    } else if (isDiscovered) {
                      onShowDiscoveryPopup('alreadyDiscovered');
                      // それ以外の場合は発見確認のポップアップを表示
                    } else {
                      onShowDiscoveryPopup('confirm', discover);
                    }
                  }}
                >
                  // 発見状態に応じてアイコンとテキストを切り替え
                  {isDiscovered ? (
                    <CheckCircleIcon className={styles.iconDiscovered} />
                  ) : (
                    <HelpOutlineIcon className={styles.icon} />
                  )}
                  <span>{isDiscovered ? '発見済み' : '未訪問'}</span>
                </button>
              </div>
              {/* 詳細情報 */}
              <div className={styles.info}>
                <div className={styles.row}>
                  <LocationOnIcon className={styles.iconInfo} />
                  <div className={styles.text}>{spot.address ?? '住所情報なし'}</div>
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
