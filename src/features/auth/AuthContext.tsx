// AUTH-02: 認証状態管理
// ログイン状態・ユーザー情報をアプリ全体に提供する Context
import { Card } from '../../components/ui/Card';

export const AuthLayout = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#e0f2fe',
    }}
  >
    <h1 style={{ fontSize: '36px', marginBottom: '24px' }}>{title}</h1>
    <Card>{children}</Card>
  </div>
);
