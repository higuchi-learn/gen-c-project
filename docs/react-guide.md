# React 実践ガイド — 観光地共有サービス向け

> useState は知っている前提で、このプロダクトを作るために必要な知識を網羅する。
> コード例はすべてこのプロジェクトの機能に沿ったもの。

---

## 目次

1. [useEffect — 副作用の管理](#1-useeffect)
2. [非同期データ取得パターン](#2-非同期データ取得パターン)
3. [Context API — アプリ全体の状態共有](#3-context-api)
4. [カスタムフック — ロジックの再利用](#4-カスタムフック)
5. [Props と TypeScript](#5-props-と-typescript)
6. [条件付きレンダリング](#6-条件付きレンダリング)
7. [リストレンダリング](#7-リストレンダリング)
8. [useRef — DOMへの直接アクセス](#8-useref)
9. [フォーム処理](#9-フォーム処理)
10. [useCallback / useMemo — 最適化](#10-usecallback--usememo)
11. [TanStack Router](#11-tanstack-router)
12. [Supabase との連携パターン](#12-supabase-との連携パターン)

---

## 1. useEffect

### 基本の形

```tsx
useEffect(() => {
  // 実行したい処理
  return () => {
    // クリーンアップ（省略可）
    // コンポーネントが消えるときに実行される
  };
}, [依存配列]);
```

### 依存配列の意味

| 書き方     | 実行タイミング                 |
| ---------- | ------------------------------ |
| `[]`       | マウント時に1回だけ            |
| `[userId]` | `userId` が変わるたびに        |
| なし       | 毎レンダリング（ほぼ使わない） |

### このプロジェクトでの使いどころ

**現在地の取得（useGeolocation.ts）**

```tsx
export function useGeolocation() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ブラウザの位置情報APIを呼ぶのは「副作用」なのでuseEffect内に書く
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setError(err.message);
      },
    );
  }, []); // [] = マップ表示時に1回だけ取得

  return { position, error };
}
```

**Supabase のリアルタイム購読（コメント）**

クリーンアップが重要なケース。購読を張りっぱなしにするとメモリリークする。

```tsx
useEffect(() => {
  const channel = supabase
    .channel('comments')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
      setComments((prev) => [...prev, payload.new as Comment]);
    })
    .subscribe();

  // クリーンアップ: コンポーネントが消えたら購読解除
  return () => {
    supabase.removeChannel(channel);
  };
}, [spotId]); // spotIdが変わったら再購読
```

---

## 2. 非同期データ取得パターン

Reactには「データを取ってきて表示する」という標準機能がないので、自分でパターンを作る。

### 基本パターン（loading / error / data）

```tsx
function SpotDetailPage() {
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { spotId } = Route.useParams();

  useEffect(() => {
    async function fetchSpot() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('spots').select('*').eq('id', spotId).single();

        if (error) throw error;
        setSpot(data);
      } catch (err) {
        setError('スポットの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchSpot();
  }, [spotId]);

  // 状態に応じて表示を分岐
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;
  if (!spot) return null;

  return <SpotDetail spot={spot} />;
}
```

### なぜ useEffect の中で async を直接使わないのか

```tsx
// NG: useEffectのコールバックにasyncをつけてはいけない
useEffect(async () => {
  const data = await fetchSpots(); // Promise を返すとReactが混乱する
}, []);

// OK: 内部で非同期関数を定義して呼ぶ
useEffect(() => {
  async function fetch() {
    const data = await fetchSpots();
  }
  fetch();
}, []);
```

---

## 3. Context API

### なぜ必要か

ログイン状態・現在地など「どのコンポーネントからでも使いたいデータ」を、
バケツリレー（props を何段も下に渡す）なしに届けるための仕組み。

```
App
├── Header（ここでもユーザー名を表示したい）
├── MapPage
│   └── SpotCard（ここでも "自分のスポット" 判定したい）
└── CommentSection（ここでも認証チェックしたい）
```

全部に props で `user` を渡すのは辛い → Context を使う。

### 実装パターン（AuthContext.tsx）

```tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// ① Contextの型を定義
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

// ② Contextを作成（初期値はダミー）
const AuthContext = createContext<AuthContextType>(null!);

// ③ Provider: アプリ全体を包む
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初回: 現在のセッションを確認
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // ログイン/ログアウト時に自動で更新
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}

// ④ カスタムフックとして公開（useContextを直接使わせない）
export const useAuth = () => useContext(AuthContext);
```

### main.tsx で Provider を設定

```tsx
// src/main.tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      {' '}
      {/* ← ここで包む */}
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
```

### 使う側

```tsx
// どのコンポーネントからでも
function CommentSection({ spotId }: { spotId: string }) {
  const { user } = useAuth();

  if (!user) return <p>コメントはログインが必要です</p>;

  return <CommentForm spotId={spotId} userId={user.id} />;
}
```

---

## 4. カスタムフック

`use` で始まる関数で、Reactのhookを組み合わせてロジックを再利用可能にしたもの。
このプロジェクトには `src/hooks/` と `src/features/*/hooks/` にたくさん作る予定。

### useGeolocation（現在地取得）

```tsx
// src/hooks/useGeolocation.ts
export function useGeolocation() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('このブラウザは位置情報に対応していません');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, []);

  return { position, error, loading };
}
```

### useNearbyCheck（現地限定コメントの判定）

```tsx
// src/hooks/useNearbyCheck.ts
const NEARBY_RADIUS_KM = 1.0;

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // ハーバーサイン公式（緯度経度 → 距離km）
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useNearbyCheck(spotLat: number, spotLng: number) {
  const { position } = useGeolocation(); // カスタムhookの中でカスタムhookを使える

  if (!position) return false;

  return calcDistance(position.lat, position.lng, spotLat, spotLng) <= NEARBY_RADIUS_KM;
}
```

### useSpots（スポット一覧取得）

```tsx
// src/features/spots/hooks/useSpots.ts
export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpots() {
      try {
        const { data, error } = await supabase.from('spots').select('*');
        if (error) throw error;
        setSpots(data);
      } catch {
        setError('スポットの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchSpots();
  }, []);

  return { spots, loading, error };
}
```

---

## 5. Props と TypeScript

### 基本の書き方

```tsx
// 型定義
type SpotCardProps = {
  spot: Spot;
  onTap: (spotId: string) => void;
  showImage?: boolean; // ? = 省略可能
};

// コンポーネント
function SpotCard({ spot, onTap, showImage = false }: SpotCardProps) {
  return (
    <div onClick={() => onTap(spot.id)}>
      <h3>{spot.name}</h3>
      <p>{spot.description}</p>
      {showImage && <img src={spot.imageUrl} alt={spot.name} />}
    </div>
  );
}

// 使う側
<SpotCard spot={spot} onTap={(id) => navigate({ to: '/spots/$spotId', params: { spotId: id } })} />;
```

### children を渡す

レイアウトコンポーネントで必要。

```tsx
// src/components/layout/PageLayout.tsx
type PageLayoutProps = {
  title: string;
  children: React.ReactNode; // 子要素の型
};

function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div>
      <header>
        <h1>{title}</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}

// 使う側
<PageLayout title="ミニスポット一覧">
  <SpotList spots={spots} />
</PageLayout>;
```

---

## 6. 条件付きレンダリング

### &&（trueのときだけ表示）

```tsx
// コメントは現地限定
{
  isNearby && <CommentSection spotId={spot.id} />;
}

// ローディング中だけスピナー表示
{
  loading && <Spinner />;
}
```

### 三項演算子（どちらかを表示）

```tsx
{
  user ? <button onClick={signOut}>ログアウト</button> : <Link to="/login">ログイン</Link>;
}
```

### 早期return（複数の状態分岐に読みやすい）

```tsx
function SpotDetailPage() {
  const { spot, loading, error } = useSpot(spotId);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!spot) return <NotFoundScreen />;

  // ここまで来たら spot は確実に存在する
  return <SpotDetail spot={spot} />;
}
```

---

## 7. リストレンダリング

### 基本（.map() + key）

```tsx
function SpotList({ spots }: { spots: Spot[] }) {
  return (
    <div>
      {spots.map((spot) => (
        // key は必須。Reactが「どれが更新されたか」を追跡するために使う
        // 配列のインデックス（0,1,2...）は避ける→並び替えたとき壊れる
        <SpotCard key={spot.id} spot={spot} />
      ))}
    </div>
  );
}
```

### 空の場合の表示

```tsx
function SpotList({ spots }: { spots: Spot[] }) {
  if (spots.length === 0) {
    return <p>このエリアにはまだスポットがありません。最初の発見者になろう！</p>;
  }

  return (
    <div>
      {spots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} />
      ))}
    </div>
  );
}
```

### フィルタリングと組み合わせ

```tsx
// カテゴリでフィルター
{
  spots.filter((spot) => spot.category === selectedCategory).map((spot) => <SpotCard key={spot.id} spot={spot} />);
}
```

---

## 8. useRef

### DOMへの直接アクセス（マップの初期化に必須）

地図ライブラリ（Leaflet/MapLibreなど）は「このHTML要素の中に地図を描いて」と指定する必要がある。
`useRef` で実際のDOM要素を参照するのが唯一の方法。

```tsx
import { useRef, useEffect } from 'react';
import L from 'leaflet';

function MapView() {
  // mapRef.current に <div> の実体が入る
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null); // マップインスタンスを保持

  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletRef.current) return; // 二重初期化を防ぐ

    // DOM要素を渡してマップを初期化
    leafletRef.current = L.map(mapRef.current).setView([35.6762, 139.6503], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletRef.current);

    return () => {
      leafletRef.current?.remove();
      leafletRef.current = null;
    };
  }, []);

  return <div ref={mapRef} style={{ height: '100vh' }} />;
}
```

### useRef は再レンダリングを引き起こさない

```tsx
// useState → 値が変わるたびに再レンダリング
const [count, setCount] = useState(0);

// useRef → 値が変わっても再レンダリングしない
// マップインスタンスなど「保持したいけど表示に影響しないもの」に使う
const mapInstance = useRef<L.Map | null>(null);
```

---

## 9. フォーム処理

### スポット登録フォーム（制御コンポーネント方式）

```tsx
function SpotRegisterForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { position } = useGeolocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ← ブラウザのデフォルト送信をキャンセル

    if (!user || !position) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('spots').insert({
        name,
        description,
        lat: position.lat,
        lng: position.lng,
        user_id: user.id,
      });
      if (error) throw error;
      // 登録成功後の処理（例: マップに戻る）
    } catch {
      alert('登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)} // e.target.value で入力値を取得
        placeholder="スポット名"
        required
      />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="どんな発見？" />
      <button type="submit" disabled={submitting}>
        {submitting ? '登録中...' : '登録する'}
      </button>
    </form>
  );
}
```

---

## 10. useCallback / useMemo

### 「何回も再作成されると困る」ときに使う（最適化）

最初から使わなくていい。パフォーマンス問題が起きたときに導入する。

**useCallback** — 関数を再作成させない

```tsx
// useEffectの依存配列に関数を入れるとき、毎レンダリングで再作成されてしまう問題を防ぐ
const fetchComments = useCallback(async () => {
  const { data } = await supabase.from('comments').select('*').eq('spot_id', spotId);
  setComments(data ?? []);
}, [spotId]); // spotIdが変わったときだけ再作成

useEffect(() => {
  fetchComments();
}, [fetchComments]);
```

**useMemo** — 計算結果をキャッシュする

```tsx
// 現在地からの距離でスポットをソートする処理（毎回計算は重い）
const sortedSpots = useMemo(() => {
  if (!position) return spots;
  return [...spots].sort((a, b) => {
    const distA = calcDistance(position.lat, position.lng, a.lat, a.lng);
    const distB = calcDistance(position.lat, position.lng, b.lat, b.lng);
    return distA - distB;
  });
}, [spots, position]); // spots か position が変わったときだけ再計算
```

---

## 11. TanStack Router

### ファイル構成とURL対応

```
src/routes/
  __root.tsx          → 全ページ共通（Header, AuthProvider）
  index.tsx           → /           （マップ画面）
  spots/
    $spotId.tsx       → /spots/:id  （スポット詳細）
  register.tsx        → /register   （スポット登録）
  login.tsx           → /login
```

### ページ遷移

```tsx
import { Link, useNavigate } from '@tanstack/react-router';

// Linkコンポーネント（<a>タグの代わり）
<Link to="/spots/$spotId" params={{ spotId: spot.id }}>
  詳細を見る
</Link>;

// コードから遷移（フォーム送信後など）
function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await supabase.auth.signInWithPassword({ email, password });
    navigate({ to: '/' }); // ログイン後にマップへ
  };
}
```

### URLパラメータの取得

```tsx
// src/routes/spots/$spotId.tsx
function SpotDetailPage() {
  const { spotId } = Route.useParams(); // URLの $spotId 部分が取れる

  const [spot, setSpot] = useState<Spot | null>(null);

  useEffect(() => {
    supabase
      .from('spots')
      .select('*')
      .eq('id', spotId)
      .single()
      .then(({ data }) => setSpot(data));
  }, [spotId]);

  // ...
}
```

### \_\_root.tsx でのレイアウト・認証設定

```tsx
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AuthProvider } from '@/features/auth/AuthContext';
import { Header } from '@/components/layout/Header';

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Header />
      <Outlet /> {/* 各ページがここにレンダリングされる */}
    </AuthProvider>
  ),
});
```

### ルートガード（ログイン必須ページ）

```tsx
// src/routes/register.tsx
export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: '/login' }); // 未ログインならリダイレクト
    }
  },
  component: RegisterPage,
});
```

---

## 12. Supabase との連携パターン

### データ取得

```tsx
// 全スポット取得
const { data: spots } = await supabase.from('spots').select('*');

// 特定スポット取得
const { data: spot } = await supabase.from('spots').select('*').eq('id', spotId).single();

// リレーションを含めて取得（スポット + コメント）
const { data } = await supabase.from('spots').select('*, comments(*)').eq('id', spotId).single();
```

### データ登録

```tsx
const { error } = await supabase.from('spots').insert({
  name: 'ひっそりした石畳',
  description: '観光客が通らない裏道にある古い石畳',
  lat: 35.6762,
  lng: 139.6503,
  user_id: user.id,
});
```

### 認証

```tsx
// メール/パスワードでログイン
const { error } = await supabase.auth.signInWithPassword({ email, password });

// 新規登録
const { error } = await supabase.auth.signUp({ email, password });

// ログアウト
await supabase.auth.signOut();

// 現在のユーザー取得
const {
  data: { user },
} = await supabase.auth.getUser();
```

---

## まとめ：機能別に使うhook

| 機能                 | 使うhook・概念                                    |
| -------------------- | ------------------------------------------------- |
| マップ表示           | `useRef`（DOM）+ `useEffect`（初期化）            |
| 現在地取得           | `useEffect` → カスタムhook `useGeolocation`       |
| ログイン状態         | `createContext` + `useContext` → `useAuth`        |
| スポット一覧         | `useEffect` + `useState`（loading/error/data）    |
| 現地限定判定         | `useGeolocation` + 距離計算 → `useNearbyCheck`    |
| リアルタイムコメント | `useEffect`（購読）+ クリーンアップ               |
| スポット登録フォーム | `useState`（フォーム値）+ `useEffect`（位置情報） |
| ページ遷移           | TanStack Router `useNavigate` / `Link`            |
| ソート・フィルター   | `useMemo`                                         |

## 実装を始める順番

1. **`useGeolocation`** を実装 → useEffect の感覚をつかむ
2. **`AuthContext`** を実装 → useContext の使い方を覚える
3. **`useSpots`** を実装 → データ取得パターンを確立する
4. **マップコンポーネント** → useRef でLeafletを動かす
5. 以降は組み合わせるだけ
