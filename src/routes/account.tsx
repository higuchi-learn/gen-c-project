import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../features/auth/AuthContext';
import { LogoutButton } from '../components/ui/LogoutButton';

export const Route = createFileRoute('/account' as any)({
  component: AccountPage,
});

function AccountPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ discovery_count: 0, spot_count: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    };

    const fetchStats = async () => {
      const { data: dData } = await supabase
        .from('user_ranking')
        .select('discovery_count')
        .eq('user_id', user.id)
        .single();
      const { data: sData } = await supabase
        .from('user_spot_ranking')
        .select('spot_count')
        .eq('user_id', user.id)
        .single();
      setStats({
        discovery_count: dData?.discovery_count || 0,
        spot_count: sData?.spot_count || 0,
      });
    };

    fetchProfile();
    fetchStats();
  }, [user]);

  if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>;

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
        {/* 1. ユーザーアイコン（最上部はキープ） */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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

        {/* 2. 【入れ替え後】発見数・登録数（実績エリア） */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <div style={{ padding: '16px', backgroundColor: '#eef2ff', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#4f46e5' }}>{stats.discovery_count}</div>
            <div style={{ fontSize: '12px', color: '#191cc5', fontWeight: 'bold' }}>発見数</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a' }}>{stats.spot_count}</div>
            <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 'bold' }}>登録数</div>
          </div>
        </div>

        {/* 3. 【入れ替え後】名前・ユーザーネーム */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', color: '#111827' }}>
            {profile?.display_name || '未設定'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>@{profile?.username || 'user'}</p>
        </div>

        {/* 4. 【入れ替え後】アカウント情報（メール・都道府県） */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>メール</span>
            <span style={{ fontSize: '14px', color: '#1f2937' }}>{user.email}</span>
          </div>
          <div style={{ height: '1px', backgroundColor: '#e5e7eb' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
