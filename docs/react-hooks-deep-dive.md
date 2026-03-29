# React Hooks 深掘りガイド

> useRef / useMemo / useCallback / カスタムフック / Context API
> 「なぜ必要か」から理解する、このプロジェクト向け詳細解説

---

## まず「再レンダリング」を理解する

これを知らないと、どのhookも「なぜ必要なのか」がわからない。

### 再レンダリングとは

Reactは `useState` の値が変わるたびに、そのコンポーネントを**最初から全部再実行**する。

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  // count が変わるたびに、ここから↓が全部再実行される
  console.log('レンダリング!');

  const double = count * 2; // ← 毎回計算される
  const handleClick = () => setCount(count + 1); // ← 毎回新しく作られる

  return <button onClick={handleClick}>{double}</button>;
}
```

これが **useMemo** と **useCallback** が必要な理由につながる。

---

## 1. useRef

### 「Reactの管理外に置く箱」

useState との違いを表で整理する：

|                            | useState         | useRef                      |
| -------------------------- | ---------------- | --------------------------- |
| 値を保持できる             | ✅               | ✅                          |
| 値が変わると再レンダリング | ✅（する）       | ❌（しない）                |
| 使いどころ                 | 画面に表示する値 | 画面に影響しない値・DOM要素 |

### 使いどころ①：DOM要素への参照（地図ライブラリで必須）

地図ライブラリ（Leafletなど）は「このHTML要素の中に地図を描け」と命令する必要がある。
Reactの仮想DOMを通さず、実際のDOM要素を直接渡す唯一の方法が `useRef`。

```tsx
import { useRef, useEffect } from 'react';
import L from 'leaflet';

function MapView() {
  // ① まず「箱」を作る。中身はまだ null
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ③ useEffect が動く頃にはDOMが存在するので、ref.current に要素が入っている
    if (!mapContainerRef.current) return;

    // ④ 実際のDOM要素をLeafletに渡す
    const map = L.map(mapContainerRef.current).setView([35.6762, 139.6503], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  }, []);

  // ② ref={...} でこのdivと箱を紐づける
  return <div ref={mapContainerRef} style={{ height: '100vh' }} />;
}
```

**流れのイメージ：**

```
① useRef(null) → 箱を用意（中身: null）
② <div ref={mapContainerRef}> → ReactがDOMを作ったとき箱に入れてくれる
③ useEffect 実行時 → mapContainerRef.current に <div> の実体が入っている
④ Leafletに <div> を渡せる！
```

### 使いどころ②：マップインスタンスの保持

Leafletのmapオブジェクト自体も `useRef` で保持する。
なぜ `useState` ではダメか？→ mapを更新するたびに再レンダリングが起きて地図が壊れる。

```tsx
function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null); // マップオブジェクト用の箱

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // 二重初期化を防ぐ

    mapInstanceRef.current = L.map(mapContainerRef.current).setView([35.6762, 139.6503], 13);

    return () => {
      // クリーンアップ: コンポーネントが消えたら地図も破棄
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // スポットを地図に追加する関数からも mapInstanceRef.current で参照できる
  const addMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    L.marker([lat, lng]).addTo(mapInstanceRef.current);
  };

  return <div ref={mapContainerRef} style={{ height: '100vh' }} />;
}
```

### 使いどころ③：直前の値を記憶する

```tsx
// スポットリストが更新されたことを検知する例
function SpotList({ spots }: { spots: Spot[] }) {
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (spots.length > prevCountRef.current) {
      console.log('新しいスポットが追加された！');
    }
    prevCountRef.current = spots.length; // 再レンダリングなしで更新
  }, [spots]);

  return <div>{/* ... */}</div>;
}
```

---

## 2. useMemo

### 「計算結果を覚えておく」

```tsx
const 計算結果 = useMemo(() => {
  return 重い計算();
}, [依存する値]);
```

**問題：** Reactはレンダリングのたびに関数内を全部再実行する。
重い計算（ソート・フィルタリングなど）も毎回やり直してしまう。

**解決：** `useMemo` は依存する値が変わらない限り、前回の計算結果を使い回す。

### 例①：スポットを距離でソート

```tsx
function SpotList() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { position } = useGeolocation();

  // useMemo なしの場合：
  // selectedCategory が変わるたびに（カテゴリ変更のたびに）全スポットの距離を再計算してしまう

  // useMemo ありの場合：
  // spots か position が変わったときだけ再計算する
  const sortedSpots = useMemo(() => {
    if (!position) return spots;

    return [...spots].sort((a, b) => {
      const distA = calcDistance(position.lat, position.lng, a.lat, a.lng);
      const distB = calcDistance(position.lat, position.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [spots, position]); // spots と position が変わったときだけ再計算

  // フィルタリングも別のuseMemoで
  const filteredSpots = useMemo(() => {
    if (selectedCategory === 'all') return sortedSpots;
    return sortedSpots.filter((spot) => spot.category === selectedCategory);
  }, [sortedSpots, selectedCategory]); // selectedCategory が変わったら再実行

  return (
    <div>
      <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
      {filteredSpots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} />
      ))}
    </div>
  );
}
```

### いつ使うか

「重い」とは体感で問題になったとき。最初から全部に使う必要はない。
このプロジェクトで使いそうな箇所：

- スポットの距離ソート
- マップに表示するマーカーの座標リスト生成
- ランキングの集計

---

## 3. useCallback

### 「関数を毎回作り直さない」

```tsx
const 関数 = useCallback(() => {
  // 処理
}, [依存する値]);
```

**問題：** コンポーネントが再レンダリングされると、中で定義した関数も**毎回新しいオブジェクト**として作られる。

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // countが変わるたびに、handlePressは「別の関数」として作られる
  const handlePress = () => {
    console.log('pressed');
  };

  return <Child onPress={handlePress} />;
}
```

これが問題になるのは主に2つのケース：

### ケース①：useEffect の依存配列に関数を入れるとき

```tsx
// 問題のあるコード
function CommentSection({ spotId }: { spotId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);

  // この関数はレンダリングのたびに新しく作られる
  const fetchComments = async () => {
    const { data } = await supabase.from('comments').select('*').eq('spot_id', spotId);
    setComments(data ?? []);
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]); // fetchComments が毎回新しいので、毎回useEffectが実行される→無限ループ！
}

// 解決: useCallback でくるむ
function CommentSection({ spotId }: { spotId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase.from('comments').select('*').eq('spot_id', spotId);
    setComments(data ?? []);
  }, [spotId]); // spotId が変わったときだけ再作成

  useEffect(() => {
    fetchComments();
  }, [fetchComments]); // fetchComments が変わったとき（= spotId が変わったとき）だけ実行
}
```

### ケース②：子コンポーネントに渡す関数

```tsx
// SpotMarker はReact.memoで最適化されているとする
const SpotMarker = React.memo(({ spot, onPress }: SpotMarkerProps) => {
  return <Marker onPress={() => onPress(spot.id)} />;
});

function MapPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const navigate = useNavigate();

  // useCallback なし: MapPageが再レンダリングするたびに handleSpotPress が新しくなり
  // SpotMarker も全部再レンダリングされる（React.memoが無効化される）

  // useCallback あり: spots が変わらない限り同じ関数オブジェクト → SpotMarker は再レンダリングされない
  const handleSpotPress = useCallback(
    (spotId: string) => {
      navigate({ to: '/spots/$spotId', params: { spotId } });
    },
    [navigate],
  ); // navigate は安定しているので実質変わらない

  return (
    <MapView>
      {spots.map((spot) => (
        <SpotMarker key={spot.id} spot={spot} onPress={handleSpotPress} />
      ))}
    </MapView>
  );
}
```

### useMemo と useCallback の対応関係

```tsx
// useCallback は「関数のuseMemo」と同じ
const fn = useCallback(() => doSomething(a, b), [a, b]);

// ↑ これは↓と等しい
const fn = useMemo(() => () => doSomething(a, b), [a, b]);
```

---

## 4. カスタムフック

### 「useで始まる関数 = 自分で作るhook」

Reactのhookは関数の中でしか使えない（useEffect, useStateなど）。
カスタムフックは「hookを使ったロジックをまとめた関数」で、コンポーネントから切り出せる。

**ルール：関数名が `use` で始まること（必須）**

### 基本構造

```tsx
// コンポーネントに書くと長くなりすぎるロジック
function SpotDetailPage() {
  const { spotId } = Route.useParams();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('spots').select('*').eq('id', spotId).single();
        if (error) throw error;
        setSpot(data);
      } catch {
        setError('取得失敗');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [spotId]);

  // ... 画面の描画
}
```

これを切り出すと：

```tsx
// src/features/spots/hooks/useSpot.ts
export function useSpot(spotId: string) {
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('spots').select('*').eq('id', spotId).single();
        if (error) throw error;
        setSpot(data);
      } catch {
        setError('取得失敗');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [spotId]);

  return { spot, loading, error }; // 必要なものを返す
}

// コンポーネントが超スッキリする
function SpotDetailPage() {
  const { spotId } = Route.useParams();
  const { spot, loading, error } = useSpot(spotId); // ← 1行で済む

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;
  if (!spot) return null;
  return <SpotDetail spot={spot} />;
}
```

### このプロジェクトで作るカスタムフック一覧

**useGeolocation（現在地取得）**

```tsx
// src/hooks/useGeolocation.ts
type Position = { lat: number; lng: number };

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('位置情報が使えません');
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

**useNearbyCheck（現地限定コメント判定）**

```tsx
// src/hooks/useNearbyCheck.ts
const RADIUS_KM = 1.0;

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useNearbyCheck(spotLat: number, spotLng: number) {
  const { position } = useGeolocation(); // カスタムhookの中でカスタムhookが使える

  if (!position) return { isNearby: false, distance: null };

  const distance = calcDistance(position.lat, position.lng, spotLat, spotLng);
  return { isNearby: distance <= RADIUS_KM, distance };
}

// 使う側（SpotDetailPage）
function SpotDetailPage() {
  const { spot } = useSpot(spotId);
  const { isNearby } = useNearbyCheck(spot.lat, spot.lng);

  return (
    <div>
      <SpotInfo spot={spot} />
      {isNearby ? <CommentSection spotId={spot.id} /> : <p>現地に行くとコメントを見られます</p>}
    </div>
  );
}
```

**useComments（コメント一覧 + リアルタイム更新）**

```tsx
// src/features/comments/hooks/useComments.ts
export function useComments(spotId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初回取得
    supabase
      .from('comments')
      .select('*')
      .eq('spot_id', spotId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setComments(data ?? []);
        setLoading(false);
      });

    // リアルタイム購読（新しいコメントが投稿されたら自動追加）
    const channel = supabase
      .channel(`comments:${spotId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `spot_id=eq.${spotId}` },
        (payload) => {
          setComments((prev) => [payload.new as Comment, ...prev]);
        },
      )
      .subscribe();

    // クリーンアップ: ページを離れたら購読解除
    return () => {
      supabase.removeChannel(channel);
    };
  }, [spotId]);

  const addComment = async (text: string, userId: string) => {
    await supabase.from('comments').insert({ spot_id: spotId, user_id: userId, text });
    // リアルタイム購読が自動で setComments を呼ぶので手動更新不要
  };

  return { comments, loading, addComment };
}
```

---

## 5. Context API

### 「グローバルな本棚」のイメージ

**問題（props のバケツリレー）：**

```
App（userを持っている）
├── Header（userを使いたい） ← Appから直接渡せる
└── MapPage（userを使わないけど下に渡すために受け取る）
    └── SpotCard（userを使わないけど下に渡すために受け取る）
        └── CommentButton（userを使いたい） ← ここまでpropsを伝言ゲームで渡す
```

中間のコンポーネント（MapPage, SpotCard）は `user` を使わないのに、
下に渡すためだけに受け取る必要があり、コードが複雑になる。

**解決（Context）：**

```
App（AuthProviderでuserを「本棚に置く」）
├── Header（本棚から直接取り出す）
└── MapPage（userを知らなくていい）
    └── SpotCard（userを知らなくていい）
        └── CommentButton（本棚から直接取り出す）
```

### Context の3つの部品

```
createContext  → 本棚を作る
Provider       → 本棚に値を置く（アプリの上の方に配置）
useContext     → 本棚から値を取り出す（どこからでも使える）
```

### 実装：AuthContext（このプロジェクトの核心）

**① Context を作る（型も定義する）**

```tsx
// src/features/auth/AuthContext.tsx

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// Context に入れるデータの型
type AuthContextType = {
  user: User | null; // ログイン中のユーザー（未ログインはnull）
  loading: boolean; // 認証確認中かどうか
  signOut: () => Promise<void>;
};

// Context オブジェクトを作成
// null! はTypeScriptのごまかし（Provider外で使ったらエラーになる）
const AuthContext = createContext<AuthContextType>(null!);
```

**② Provider を作る（値の管理はここ）**

```tsx
// つづき
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // アプリ起動時: 既存のセッションを確認
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // ログイン・ログアウト時に自動で user を更新
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // クリーンアップ: 購読解除
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange が自動で user を null にしてくれる
  };

  // value に渡したものが「本棚に置かれる」
  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}
```

**③ カスタムhookとして公開（useContext を直接使わせない）**

```tsx
// つづき
// useContext(AuthContext) を直接書かず、このhookを公開する
// 理由: Provider外で使ったときのエラーメッセージを分かりやすくできる
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth は AuthProvider の中で使ってください');
  }
  return context;
}
```

**④ アプリ全体を Provider で包む**

```tsx
// src/routes/__root.tsx
import { AuthProvider } from '@/features/auth/AuthContext';

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      {' '}
      {/* ← 全ページを包む */}
      <Outlet />
    </AuthProvider>
  ),
});
```

**⑤ どこからでも使える**

```tsx
// ヘッダーコンポーネント
function Header() {
  const { user, signOut } = useAuth();

  return (
    <header>
      <Link to="/">ミニスポット</Link>
      {user ? <button onClick={signOut}>ログアウト</button> : <Link to="/login">ログイン</Link>}
    </header>
  );
}

// コメントボタン（深くネストしていても直接取れる）
function CommentButton({ spotId }: { spotId: string }) {
  const { user } = useAuth(); // propsで受け取らなくていい

  if (!user) return <p>ログインしてコメント</p>;
  return <button>コメントする</button>;
}
```

### Context を複数作る

認証以外にも必要になったら別のContextを作る。

```tsx
// 現在地をアプリ全体で共有したい場合
type LocationContextType = {
  position: { lat: number; lng: number } | null;
  error: string | null;
};

const LocationContext = createContext<LocationContextType>(null!);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { position, error } = useGeolocation(); // カスタムhookを利用
  return <LocationContext.Provider value={{ position, error }}>{children}</LocationContext.Provider>;
}

export const useLocation = () => useContext(LocationContext);
```

```tsx
// __root.tsx で重ねて使う
<AuthProvider>
  <LocationProvider>
    <Outlet />
  </LocationProvider>
</AuthProvider>
```

---

## 全体の関係図

```
Context API
  └─ アプリ全体の状態（ログイン情報・現在地）を「本棚」に置く仕組み

カスタムフック
  └─ useEffect + useState + Context をまとめて再利用可能にする
  └─ 例: useGeolocation, useSpot, useComments, useNearbyCheck

useRef
  └─ 再レンダリングを引き起こさずに「何か」を保持する
  └─ 地図のDOM要素・Leafletインスタンスの保持に必須

useMemo
  └─ 重い計算を「依存値が変わったときだけ」再計算する
  └─ 例: スポットの距離ソート・フィルタリング

useCallback
  └─ 関数を「依存値が変わったときだけ」再作成する
  └─ useEffectの依存配列に関数を入れるときに使う
```

## 迷ったときの判断フロー

```
値を持ちたい
  ├─ 画面に表示する → useState
  └─ 画面に影響しない（DOMやインスタンスの保持）→ useRef

複数コンポーネントで同じ値を使いたい
  ├─ 親子関係が近い → props でいい
  └─ 離れている・深い → Context API

重い処理がある
  ├─ 計算結果をキャッシュしたい → useMemo
  └─ 関数をキャッシュしたい → useCallback

ロジックが長くなってきた
  └─ use〇〇 として切り出す → カスタムフック
```
