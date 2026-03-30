import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import type { User } from '@supabase/supabase-js';

// 認証状態を管理するコンテキストの型定義
type AuthContextType = {
  user: User | null;
  loading: boolean;
};

// 認証状態を管理するコンテキストの定義, 未ログインであればuserはnull
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// 認証状態を利用するためのカスタムフックを定義
// 他コンポーネントで const { user } = useAuth() と書けるようにする
export const useAuth = () => useContext(AuthContext);

// 認証状態を提供するプロバイダコンポーネント
// childrenで囲まれたコンポーネントは、useAuth()でユーザー情報にアクセスできるようになる
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // ログイン時に現在のURLのsearchパラメータからredirect先を読み取るために使用
  const router = useRouter();

  useEffect(() => {
    // ログイン状態の維持のため、初回レンダリング時に現在のセッションからユーザー情報を取得
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // セッション変化を監視
    // onAuthStateChangeは、サインイン・サインアウトなどの認証状態の変化を検知するSupabaseのAPI
    // subscrkptionは, 監視中であることを示すオブジェクト
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // サインインしたときにユーザーのusernameを確認
      if (event === 'SIGNED_IN' && currentUser) {
        const { data }: { data: { username: string | null } | null } = await supabase
          .from('users')
          .select('username')
          .eq('id', currentUser.id)
          .single();

        // 未登録ならプロフィール設定へ遷移、登録済みならredirect先（なければ/）へ遷移
        if (!data?.username) {
          void navigate({ to: '/profile-setup' });
        } else {
          // ログイン前にリダイレクトさせたいパスが指定されていればそこへ、なければトップへ遷移
          const storedRedirect = sessionStorage.getItem('postLoginRedirect');
          // ログイン後にリダイレクトさせたいパスがあればセッションストレージに保存しておいたものを読み取る
          sessionStorage.removeItem('postLoginRedirect');
          const search = router.state.location.search as { redirect?: string };
          void navigate({ to: storedRedirect ?? search.redirect ?? '/' });
        }
      }
    });
    // useEffect再実行時にクリーンアップ関数でサブスクリプションを解除
    // subscriptionは「この監視を止めてください」という Supabase の API から返されるオブジェクト
    return () => subscription.unsubscribe();
  }, [navigate]);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

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
