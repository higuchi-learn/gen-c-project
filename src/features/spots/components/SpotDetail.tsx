import React from 'react';
import styles from './SpotDetail.module.css';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';

export const SpotDetail: React.FC = () => {
  return (
    <div className={styles.bottomSheet}>
      /* ドラッグハンドル */
      <button className={styles.buttonArea}>
        <div className={styles.handle} />
      </button>
      /* ヘッダー部分 */
      <div className={styles.header}>
        <h1 className={styles.title}>スポットスポットスポットスポットスポット</h1>
        <button className={styles.closeBtn}>
          <CloseIcon className={styles.iconInfo} />
        </button>
      </div>
      /* スポットの状態 */
      <div className={styles.iconsRow}>
        <div className={styles.iconItem}>
          <DirectionsWalkIcon className={styles.icon} />
          <div>
            {' '}
            nkm <br />
            n分
          </div>
        </div>
        <div className={styles.iconItem}>
          <HelpOutlineIcon className={styles.icon} />
          <div>未訪問</div>
        </div>
      </div>
      /* 詳細情報 */
      <div className={styles.info}>
        <div className={styles.row}>
          <LocationOnIcon className={styles.iconInfo} />
          <div className={styles.text}>〒012-3456 ◯◯県◯◯市◯◯町◯◯123</div>
        </div>
        <div className={styles.row}>
          <AccountCircleIcon className={styles.iconInfo} />
          <div className={styles.text}>hogehoge</div>
        </div>
        <div className={styles.row}>
          <AssignmentIcon className={styles.iconInfo} />
          <div className={styles.text}>hogehogehogehogehogehogehogehogehogehogehogehoge</div>
        </div>
        /* 写真関連 */
        <button className={styles.photoButton}>写真を見る</button>
        <div className={styles.img} />
      </div>
    </div>
  );
};
