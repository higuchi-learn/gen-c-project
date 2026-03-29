# React パターン集 — やりたいことから引く辞書

> 「これどう書くんだっけ」を実装中に素早く解決するための辞書。
> JavaScript は知っている前提。難しい説明は省いてコードを優先。

---

## 目次（やりたいことから探す）

- [ボタンを押したら何かしたい](#ボタンを押したら何かしたい)
- [テキストボックスの入力値を使いたい](#テキストボックスの入力値を使いたい)
- [APIからデータを取得して表示したい](#apiからデータを取得して表示したい)
- [ローディング中・エラー時の表示を切り替えたい](#ローディング中エラー時の表示を切り替えたい)
- [条件によって表示を切り替えたい](#条件によって表示を切り替えたい)
- [リストを表示したい](#リストを表示したい)
- [ページ遷移したい](#ページ遷移したい)
- [URLのパラメータを取得したい](#urlのパラメータを取得したい)
- [ログイン状態を取得したい](#ログイン状態を取得したい)
- [現在地を取得したい](#現在地を取得したい)
- [地図を表示したい（Leaflet）](#地図を表示したいleaflet)
- [フォームを送信したい](#フォームを送信したい)
- [コンポーネントを分割したい（props）](#コンポーネントを分割したいprops)
- [タップで表示/非表示を切り替えたい](#タップで表示非表示を切り替えたい)
- [いいね（トグル）機能を作りたい](#いいねトグル機能を作りたい)
- [データが更新されたら自動で画面に反映したい（リアルタイム）](#データが更新されたら自動で画面に反映したいリアルタイム)
- [カスタムフックを自分で作りたい](#カスタムフックを自分で作りたい)
- [Context を自分で作りたい](#context-を自分で作りたい)
- [TypeScript の型の書き方](#typescript-の型の書き方)
- [デバッグの仕方](#デバッグの仕方)
- [よくあるエラーと解決法](#よくあるエラーと解決法)
- [Supabase クイックリファレンス](#supabase-クイックリファレンス)

---

## ボタンを押したら何かしたい

```tsx
function MyComponent() {
  const handleClick = () => {
    console.log('押された');
  };

  return <button onClick={handleClick}>押す</button>;
}
```

引数を渡したいとき（例: スポットIDを渡す）:

```tsx
// NG: こう書くと、ボタンを押さなくても即実行される
<button onClick={handlePress(spot.id)}>押す</button>

// OK: アロー関数でくるむ
<button onClick={() => handlePress(spot.id)}>押す</button>
```

---

## テキストボックスの入力値を使いたい

```tsx
import { useState } from 'react';

function SpotNameInput() {
  const [name, setName] = useState(''); // 入力値を state で管理

  return (
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)} // e.target.value が入力値
      placeholder="スポット名"
    />
  );
}
```

複数のフィールドがある場合:

```tsx
function SpotForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="名前" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="説明" />
    </form>
  );
}
```

---

## APIからデータを取得して表示したい

**鉄板パターン。毎回このテンプレをコピペして使う。**

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function SpotList() {
  const [spots, setSpots] = useState([]); // データの入れ物
  const [loading, setLoading] = useState(true); // 読み込み中フラグ
  const [error, setError] = useState(null); // エラーの入れ物

  useEffect(() => {
    // useEffect の中で async を直接使えないので、関数を作って呼ぶ
    async function fetchData() {
      try {
        const { data, error } = await supabase.from('spots').select('*');
        if (error) throw error;
        setSpots(data);
      } catch (err) {
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false); // 成功でも失敗でも必ず false にする
      }
    }

    fetchData();
  }, []); // [] = 画面が表示されたときに1回だけ実行

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ul>
      {spots.map((spot) => (
        <li key={spot.id}>{spot.name}</li>
      ))}
    </ul>
  );
}
```

特定IDのデータを取得する場合:

```tsx
useEffect(() => {
  async function fetchData() {
    const { data } = await supabase
      .from('spots')
      .select('*')
      .eq('id', spotId) // id が spotId と等しいものだけ
      .single(); // 1件だけ取得
    setSpot(data);
  }
  fetchData();
}, [spotId]); // spotId が変わったら再取得
```

---

## ローディング中・エラー時の表示を切り替えたい

```tsx
function Page() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... データ取得処理

  // 上から順に判定して、条件に合ったら return する
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  if (!data) return <div>データがありません</div>;

  // ここに来たら data は確実に存在する
  return <div>{data.name}</div>;
}
```

---

## 条件によって表示を切り替えたい

**どちらかを表示（三項演算子）:**

```tsx
{
  user ? <button onClick={signOut}>ログアウト</button> : <a href="/login">ログイン</a>;
}
```

**条件が true のときだけ表示（&& 演算子）:**

```tsx
// 現地にいるときだけコメント欄を表示
{
  isNearby && <CommentSection />;
}

// ローディング中だけスピナーを表示
{
  loading && <Spinner />;
}
```

**注意: 0 は表示されてしまう**

```tsx
// NG: spots.length が 0 のとき、"0" が画面に表示される
{
  spots.length && <SpotList spots={spots} />;
}

// OK: 明示的に boolean にする
{
  spots.length > 0 && <SpotList spots={spots} />;
}
```

---

## リストを表示したい

```tsx
function SpotList({ spots }) {
  return (
    <ul>
      {spots.map((spot) => (
        // key は必須。spot.id など一意の値を使う（配列のインデックスは使わない）
        <li key={spot.id}>
          <span>{spot.name}</span>
          <span>{spot.description}</span>
        </li>
      ))}
    </ul>
  );
}
```

空の場合の表示:

```tsx
function SpotList({ spots }) {
  if (spots.length === 0) {
    return <p>スポットがまだありません</p>;
  }

  return (
    <ul>
      {spots.map((spot) => (
        <li key={spot.id}>{spot.name}</li>
      ))}
    </ul>
  );
}
```

フィルタリングしてから表示:

```tsx
{
  spots
    .filter((spot) => spot.category === 'food') // 絞り込み
    .map((spot) => <SpotCard key={spot.id} spot={spot} />);
}
```

---

## ページ遷移したい

**リンク（クリックで遷移）:**

```tsx
import { Link } from '@tanstack/react-router'

// 固定URL
<Link to="/login">ログインページへ</Link>

// パラメータ付き（スポット詳細など）
<Link to="/spots/$spotId" params={{ spotId: spot.id }}>
  詳細を見る
</Link>
```

**コードから遷移（ボタン押下後・送信後など）:**

```tsx
import { useNavigate } from '@tanstack/react-router';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await supabase.auth.signInWithPassword({ email, password });
    navigate({ to: '/' }); // ログイン成功後にトップへ
  };

  return <button onClick={handleLogin}>ログイン</button>;
}
```

---

## URLのパラメータを取得したい

`/spots/abc123` にアクセスされたとき、`abc123` の部分を取得する。

```tsx
// src/routes/spots/$spotId.tsx
function SpotDetailPage() {
  const { spotId } = Route.useParams(); // "abc123" が取れる

  useEffect(() => {
    supabase
      .from('spots')
      .select('*')
      .eq('id', spotId)
      .single()
      .then(({ data }) => setSpot(data));
  }, [spotId]);
}
```

---

## ログイン状態を取得したい

```tsx
import { useAuth } from '@/features/auth/AuthContext';

function SomeComponent() {
  const { user, loading } = useAuth();

  if (loading) return null; // 認証確認中は何も表示しない

  if (!user) {
    return <p>ログインしてください</p>;
  }

  return <p>ようこそ {user.email} さん</p>;
}
```

**`useAuth` で取得できるもの:**

| 変数         | 内容                                        |
| ------------ | ------------------------------------------- |
| `user`       | ログイン中のユーザー（未ログインは `null`） |
| `user.id`    | ユーザーID（DBに保存するときに使う）        |
| `user.email` | メールアドレス                              |
| `loading`    | 認証状態を確認中かどうか                    |
| `signOut`    | ログアウトする関数                          |

---

## 現在地を取得したい

```tsx
import { useGeolocation } from '@/hooks/useGeolocation';

function MapPage() {
  const { position, error, loading } = useGeolocation();

  if (loading) return <div>位置情報を取得中...</div>;
  if (error) return <div>位置情報の取得に失敗: {error}</div>;

  // position.lat, position.lng が使える
  return (
    <div>
      緯度: {position.lat}, 経度: {position.lng}
    </div>
  );
}
```

---

## 地図を表示したい（Leaflet）

地図ライブラリは HTML の `<div>` 要素を直接受け取って動く。
`useRef` でその要素を渡す。

```tsx
import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapView() {
  const mapRef = useRef(null); // 地図を描く <div> への参照
  const mapInstanceRef = useRef(null); // Leaflet インスタンスの保存用

  useEffect(() => {
    if (!mapRef.current) return; // div がまだ存在しないなら何もしない
    if (mapInstanceRef.current) return; // 地図が既にあるなら作らない

    // Leaflet に <div> を渡して地図を初期化
    mapInstanceRef.current = L.map(mapRef.current).setView([35.6762, 139.6503], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);

    return () => {
      // 画面を離れたら地図を破棄
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ref={mapRef} でこの div と mapRef を紐づける
  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
}
```

スポットのマーカーを追加する:

```tsx
useEffect(() => {
  if (!mapInstanceRef.current) return;

  spots.forEach((spot) => {
    L.marker([spot.lat, spot.lng])
      .bindPopup(spot.name) // クリックで名前を表示
      .addTo(mapInstanceRef.current);
  });
}, [spots]); // spots が更新されたら再描画
```

---

## フォームを送信したい

```tsx
function SpotRegisterForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const { position } = useGeolocation();

  const handleSubmit = async (e) => {
    e.preventDefault(); // ブラウザのデフォルト動作（ページリロード）をキャンセル

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
      alert('登録しました！');
    } catch {
      alert('登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="スポット名" required />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="どんな発見？" />
      {/* disabled で二重送信を防止 */}
      <button type="submit" disabled={submitting}>
        {submitting ? '登録中...' : '登録する'}
      </button>
    </form>
  );
}
```

---

## コンポーネントを分割したい（props）

「このコードが長くなってきた」「同じ UI を複数の場所で使いたい」ときに分割する。

```tsx
// 分割したコンポーネント（値を受け取る側）
function SpotCard({ spot, onPress }) {
  return (
    <div onClick={() => onPress(spot.id)}>
      <h3>{spot.name}</h3>
      <p>{spot.description}</p>
    </div>
  );
}

// 使う側（値を渡す側）
function SpotList({ spots }) {
  const navigate = useNavigate();

  return (
    <div>
      {spots.map((spot) => (
        <SpotCard
          key={spot.id}
          spot={spot}
          onPress={(id) => navigate({ to: '/spots/$spotId', params: { spotId: id } })}
        />
      ))}
    </div>
  );
}
```

TypeScript で型を付ける（推奨）:

```tsx
// 型を定義すると「何を渡せばいいか」がエディタで補完される
type SpotCardProps = {
  spot: {
    id: string;
    name: string;
    description: string;
  };
  onPress: (id: string) => void;
};

function SpotCard({ spot, onPress }: SpotCardProps) {
  // ...
}
```

---

## タップで表示/非表示を切り替えたい

このプロダクトの仕様：画像はタップするまで非表示。

```tsx
import { useState } from 'react';

function SpotCard({ spot }) {
  const [imageVisible, setImageVisible] = useState(false);

  return (
    <div>
      <h3>{spot.name}</h3>
      <p>{spot.description}</p>

      {/* 画像が非表示のとき → ボタンを表示 */}
      {!imageVisible && <button onClick={() => setImageVisible(true)}>画像を見る</button>}

      {/* 画像が表示状態のとき → 画像を表示 */}
      {imageVisible && <img src={spot.imageUrl} alt={spot.name} />}
    </div>
  );
}
```

トグル（押すたびに切り替わる）にする場合:

```tsx
// setImageVisible(true) の代わりに
<button onClick={() => setImageVisible((prev) => !prev)}>{imageVisible ? '画像を隠す' : '画像を見る'}</button>
```

---

## いいね（トグル）機能を作りたい

```tsx
function LikeButton({ spotId, initialLiked, initialCount }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const { user } = useAuth();

  const handleLike = async () => {
    if (!user) return; // 未ログインは何もしない

    if (liked) {
      // いいね解除
      await supabase.from('likes').delete().eq('spot_id', spotId).eq('user_id', user.id);
      setLiked(false);
      setCount((prev) => prev - 1);
    } else {
      // いいね
      await supabase.from('likes').insert({ spot_id: spotId, user_id: user.id });
      setLiked(true);
      setCount((prev) => prev + 1);
    }
  };

  return (
    <button onClick={handleLike}>
      {liked ? '❤️' : '🤍'} {count}
    </button>
  );
}
```

---

## データが更新されたら自動で画面に反映したい（リアルタイム）

Supabase のリアルタイム機能を使う。誰かがコメントを投稿したとき、ページをリロードしなくても自動で表示される。

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function CommentSection({ spotId }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // ① まず既存のコメントを全件取得
    supabase
      .from('comments')
      .select('*')
      .eq('spot_id', spotId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setComments(data ?? []));

    // ② 新しいコメントが追加されたら自動で反映
    const channel = supabase
      .channel(`comments-${spotId}`) // チャンネル名（一意にする）
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // 新規追加のとき
          schema: 'public',
          table: 'comments',
          filter: `spot_id=eq.${spotId}`, // このスポットのコメントだけ
        },
        (payload) => {
          // 新しいコメントをリストの先頭に追加
          setComments((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    // ③ 画面を離れたら購読を解除する（重要！）
    return () => {
      supabase.removeChannel(channel);
    };
  }, [spotId]);

  return (
    <ul>
      {comments.map((comment) => (
        <li key={comment.id}>{comment.text}</li>
      ))}
    </ul>
  );
}
```

**ポイント:** `return () => { supabase.removeChannel(channel) }` を忘れると、
画面を離れても購読が残り続けてパフォーマンスが悪化する。

---

## カスタムフックを自分で作りたい

「コンポーネントの中のロジックが長くなってきた」ときに切り出す。
`use` で始まる関数名にするだけで、あとは普通の関数と同じ。

**手順：**

① コンポーネントに書いているコードを確認する

```tsx
function SpotDetailPage() {
  const { spotId } = Route.useParams();
  // ↓ このデータ取得ロジックを切り出したい
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
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

  return <div>{spot?.name}</div>;
}
```

② 新しいファイルを作り、`use` で始まる関数に移す

```tsx
// src/features/spots/hooks/useSpot.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useSpot(spotId: string) {
  // コンポーネントからロジックをそのまま持ってくる
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
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

  // 使う側が必要なものを return で返す
  return { spot, loading, error };
}
```

③ コンポーネントで import して使う

```tsx
import { useSpot } from '@/features/spots/hooks/useSpot';

function SpotDetailPage() {
  const { spotId } = Route.useParams();
  const { spot, loading, error } = useSpot(spotId); // 1行になった

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;

  return <div>{spot?.name}</div>;
}
```

---

## Context を自分で作りたい

「複数のコンポーネントで同じデータを使いたいが、props で渡すのが面倒」なとき。

**手順：**

① ファイルを作る（例: `src/features/auth/AuthContext.tsx`）

```tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// ① Context が持つデータの型を定義
type AuthContextType = {
  user: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

// ② Context を作る（null! はおまじないとして覚えておく）
const AuthContext = createContext<AuthContextType>(null!);

// ③ Provider: データを管理して子コンポーネント全体に届ける
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

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

  return (
    // value に渡したものが全コンポーネントから参照できる
    <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
  );
}

// ④ 使いやすいようにカスタムフックとして公開
export function useAuth() {
  return useContext(AuthContext);
}
```

② `__root.tsx` で Provider を設定する（1回だけ）

```tsx
// src/routes/__root.tsx
import { AuthProvider } from '@/features/auth/AuthContext';

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
});
```

③ どこからでも `useAuth()` で取得できる

```tsx
// どのコンポーネントでも
const { user, signOut } = useAuth();
```

---

## TypeScript の型の書き方

React を書くうえで最低限知っておくと助かる型の書き方。

**基本の型:**

```tsx
// よく使う型
const name: string = 'hello';
const count: number = 0;
const flag: boolean = true;
const items: string[] = ['a', 'b']; // 配列
const value: string | null = null; // null になりえる
```

**オブジェクトの型（= Spotの型）:**

```tsx
type Spot = {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  user_id: string;
  created_at: string;
  image_url: string | null; // null になりえる場合は | null
};
```

**関数の型:**

```tsx
// 引数と戻り値に型を付ける
function calcDistance(lat1: number, lng1: number): number {
  return 0;
}

// 型だけを定義する（propsの onPress など）
type OnPressHandler = (id: string) => void;
```

**useState に型を付ける:**

```tsx
// 型を明示する（初期値から推論できない場合）
const [spot, setSpot] = useState<Spot | null>(null);
const [spots, setSpots] = useState<Spot[]>([]);
const [error, setError] = useState<string | null>(null);
```

**型エラーが出たときの対処:**

```tsx
// エラー: 'string | null' は 'string' に割り当てられない
const name: string = spot.name; // spot.name が null の可能性がある

// 解決①: null チェックをする
if (spot.name) {
  const name: string = spot.name; // ここでは string 確定
}

// 解決②: デフォルト値を使う
const name: string = spot.name ?? '名前なし';

// 解決③: Optional chaining（null なら undefined を返す）
const upper = spot.name?.toUpperCase();
```

---

## デバッグの仕方

### console.log で値を確認する

```tsx
function SpotCard({ spot }) {
  console.log('SpotCard が描画された', spot); // ブラウザの開発者ツール > Console で見える

  return <div>{spot.name}</div>;
}
```

useEffect の中でも使える:

```tsx
useEffect(() => {
  console.log('spotId が変わった:', spotId);
}, [spotId]);
```

### よくある確認ポイント

```tsx
// データが取れているか確認
const { data, error } = await supabase.from('spots').select('*');
console.log('data:', data); // データの中身
console.log('error:', error); // エラーがあれば表示される

// state が正しく更新されているか確認
const [spots, setSpots] = useState([]);
console.log('現在の spots:', spots); // コンポーネントの再レンダリングのたびに出力される
```

### 開発者ツールの開き方

`F12` または `右クリック → 検証`

| タブ     | 用途                                 |
| -------- | ------------------------------------ |
| Console  | console.log の出力・エラーメッセージ |
| Network  | APIリクエストの内容・レスポンス      |
| Elements | HTMLの構造確認                       |

### エラーメッセージの読み方

```
TypeError: Cannot read properties of null (reading 'name')
  at SpotCard (SpotCard.tsx:5)
```

- `SpotCard.tsx:5` → SpotCard.tsx の5行目が原因
- `reading 'name'` → `.name` にアクセスしようとした
- `null` → 対象が null だった

→ `spot` が null のまま `spot.name` を読もうとしている。null チェックを追加する。

---

## よくあるエラーと解決法

### 「Objects are not valid as a React child」

オブジェクトをそのまま表示しようとしている。

```tsx
// NG: user はオブジェクトなのでそのまま表示できない
<div>{user}</div>

// OK: オブジェクトの中のプロパティを表示する
<div>{user.email}</div>
```

### 「Cannot read properties of null」

データがまだ取れていない（null）のにプロパティにアクセスしている。

```tsx
// NG: spot が null のとき spot.name でエラー
<div>{spot.name}</div>

// OK: null チェックを先に行う
if (!spot) return null
return <div>{spot.name}</div>

// または Optional chaining を使う
<div>{spot?.name}</div>
```

### useEffect が無限ループする

依存配列に毎回変わるものが入っている。

```tsx
// NG: fetchData は毎回新しく作られるので無限ループ
const fetchData = async () => { ... }
useEffect(() => { fetchData() }, [fetchData])

// OK: useEffect の中で関数を定義する
useEffect(() => {
  async function fetchData() { ... }
  fetchData()
}, [spotId])
```

### useState の更新が即反映されない

```tsx
// NG: setCount した直後に count を読んでも古い値のまま
const handleClick = () => {
  setCount(count + 1);
  console.log(count); // まだ古い値が出る
};

// OK: 更新後の値が必要なら useEffect で監視する
useEffect(() => {
  console.log(count); // count が変わったときに実行される
}, [count]);
```

### `map` で key の警告が出る

```
Warning: Each child in a list should have a unique "key" prop.
```

```tsx
// NG
{
  spots.map((spot) => <SpotCard spot={spot} />);
}

// OK: key に一意の値を渡す
{
  spots.map((spot) => <SpotCard key={spot.id} spot={spot} />);
}
```

---

## Supabase クイックリファレンス

```tsx
// 全件取得
const { data } = await supabase.from('spots').select('*');

// 条件付き取得（id が一致するもの1件）
const { data } = await supabase.from('spots').select('*').eq('id', spotId).single();

// 新規作成
const { error } = await supabase.from('spots').insert({ name, lat, lng, user_id: user.id });

// 更新
const { error } = await supabase.from('spots').update({ name }).eq('id', spotId);

// 削除
const { error } = await supabase.from('spots').delete().eq('id', spotId);

// ログイン
const { error } = await supabase.auth.signInWithPassword({ email, password });

// 新規登録
const { error } = await supabase.auth.signUp({ email, password });

// ログアウト
await supabase.auth.signOut();
```
