import React from 'react';
import { useState } from 'react';
import { FooterButton } from '../ui/FooterButton';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import MapIcon from '@mui/icons-material/Map';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '80px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  label: { marginTop: '4px' },
};

export function Footer() {
  const [activeButton, setActiveButton] = useState<number>(0);

  const handleClick = (index: number) => {
    setActiveButton(index); // クリックされたボタンを`primary`に設定
  };

  return (
    <footer style={styles.footer}>
      <FooterButton variant={activeButton === 0 ? 'active' : 'default'} onClick={() => handleClick(0)}>
        <AddLocationIcon />
        <span style={styles.label}>追加</span>
      </FooterButton>
      <FooterButton variant={activeButton === 1 ? 'active' : 'default'} onClick={() => handleClick(1)}>
        <MapIcon />
        <span style={styles.label}>マップ</span>
      </FooterButton>
      <FooterButton variant={activeButton === 2 ? 'active' : 'default'} onClick={() => handleClick(2)}>
        <AccountCircleIcon />
        <span style={styles.label}>アカウント</span>
      </FooterButton>
    </footer>
  );
}
