import { useEffect, useState } from 'react';
import { createFileRoute, Link, Outlet, useChildMatches } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../features/auth/AuthContext';
import { LogoutButton } from '../components/ui/LogoutButton';
import type { UserProfile } from '../types';

// DB ビューの型定義（database.types.ts に未含有のため手動定義）
type UserRankingRow = { discovery_count: number };
type UserSpotRankingRow = { spot_count: number };

export const Route = createFileRoute('/account')({
  component: AccountPage,
});

function AccountPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ discovery_count: 0, spot_count: 0 });

  const childMatches = useChildMatches();
  const isSubRoute = childMatches.length > 0;

  useEffect(() => {
    if (!user || isSubRoute) return;

    const fetchProfile = async () => {
      const result = await supabase.from('users').select('*').eq('id', user.id).single<UserProfile>();
      if (result.data) setProfile(result.data);
    };

    const fetchStats = async () => {
      const { data: dData } = await supabase
        .from('user_ranking')
        .select('discovery_count')
        .eq('user_id', user.id)
        .single<UserRankingRow>();
      const { data: sData } = await supabase
        .from('user_spot_ranking')
        .select('spot_count')
        .eq('user_id', user.id)
        .single<UserSpotRankingRow>();
      setStats({
        discovery_count: dData?.discovery_count ?? 0,
        spot_count: sData?.spot_count ?? 0,
      });
    };

    void fetchProfile();
    void fetchStats();
  }, [user, isSubRoute]);

  if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>;

  if (isSubRoute) {
    return <Outlet />;
  }

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '28px',
          padding: '32px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          maxWidth: '400px',
          margin: '0 auto',
        }}
      >
        {/* 1. ユーザーアイコン（最上部） */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img
            src={profile?.icon_image || 'https://via.placeholder.com/120'}
            alt="UserIcon"
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #6366f1',
            }}
          />
        </div>

        {/* 2. 名前・ユーザーネーム */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', color: '#111827' }}>
            {profile?.display_name || '未設定'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>@{profile?.username || 'user'}</p>
        </div>

        {/* 3. 発見数・登録数（アイコン・名前の下に移動） */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <div style={{ padding: '16px', backgroundColor: '#eef2ff', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#4f46e5' }}>{stats.discovery_count}</div>
            <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: 'bold', marginTop: '4px' }}>発見数</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a' }}>{stats.spot_count}</div>
            <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 'bold', marginTop: '4px' }}>登録数</div>
          </div>
        </div>

        {/* 4. アカウント情報（スポットの編集・メール・都道府県） */}
        <div
          style={{
            backgroundColor: '#f9fafb',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* スポットの編集（リンク） */}
          <Link
            to="/account/spots"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              color: '#1f2937',
              fontWeight: 'bold',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px' }}>スポットの編集</span>
            </div>
            <span style={{ color: '#9ca3af' }}>＞</span>
          </Link>
          <div style={{ height: '8px' }}></div> {/* 少し隙間をあける */}
          {/* メールアドレス */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>メール</span>
            <span style={{ fontSize: '14px', color: '#1f2937' }}>{user.email}</span>
          </div>
          <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0' }}></div>
          {/* 都道府県 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>都道府県</span>
            <span style={{ fontSize: '14px', color: '#1f2937' }}>{profile?.residence || '未設定'}</span>
          </div>
        </div>

        {/* 5. ログアウトボタン */}
        <div style={{ marginTop: '32px' }}>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
