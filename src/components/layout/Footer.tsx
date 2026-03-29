import { useNavigate, useLocation } from '@tanstack/react-router';
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
  const navigate = useNavigate();
  // 現在のパスに基づいてアクティブなボタンを決定する
  const { pathname } = useLocation();

  const activeButton = pathname === '/new-spot' ? 0 : pathname === '/' ? 1 : 2;

  return (
    <footer style={styles.footer}>
      <FooterButton
        variant={activeButton === 0 ? 'active' : 'default'}
        onClick={() => void navigate({ to: '/new-spot' })}
      >
        <AddLocationIcon />
        <span style={styles.label}>追加</span>
      </FooterButton>
      <FooterButton variant={activeButton === 1 ? 'active' : 'default'} onClick={() => void navigate({ to: '/' })}>
        <MapIcon />
        <span style={styles.label}>マップ</span>
      </FooterButton>
      <FooterButton
        variant={activeButton === 2 ? 'active' : 'default'}
        onClick={() => void navigate({ to: '/account' })}
      >
        <AccountCircleIcon />
        <span style={styles.label}>アカウント</span>
      </FooterButton>
    </footer>
  );
}
