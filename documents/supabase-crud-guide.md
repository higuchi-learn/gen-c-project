# Supabase CRUD 操作ガイド

## 前提

- 型は `src/types/index.ts` からインポートする
- Supabaseクライアントは `src/lib/supabase.ts` からインポートする

```ts
import { supabase } from '@/lib/supabase';
import type { Spot, SpotInsert, SpotUpdate, Comment, CommentInsert } from '@/types';
```

---

## Spots（スポット）

### READ: 一覧取得

```ts
const { data, error } = await supabase.from('spots').select('*');

if (error) {
  console.error(error);
  return;
}

const spots: Spot[] = data;
```

### READ: 1件取得

```ts
const { data, error } = await supabase
  .from('spots')
  .select('*')
  .eq('id', spotId)
  .single();

const spot: Spot = data;
```

### CREATE: 登録

```ts
const newSpot: SpotInsert = {
  name: 'ミニスポット名',
  description: '説明文',
  lat: 35.6895,
  lng: 139.6917,
  user_id: 'ユーザーID',
};

const { data, error } = await supabase
  .from('spots')
  .insert(newSpot)
  .select()
  .single();

const spot: Spot = data;
```

### UPDATE: 更新

```ts
const updates: SpotUpdate = {
  name: '新しい名前',
  description: '新しい説明',
};

const { data, error } = await supabase
  .from('spots')
  .update(updates)
  .eq('id', spotId)
  .select()
  .single();
```

### DELETE: 削除

```ts
const { error } = await supabase
  .from('spots')
  .delete()
  .eq('id', spotId);
```

---

## Comments（コメント）

### READ: スポットに紐づくコメント一覧

```ts
const { data, error } = await supabase
  .from('comments')
  .select('*')
  .eq('spot_id', spotId)
  .order('created_at', { ascending: false });

const comments: Comment[] = data ?? [];
```

### CREATE: コメント投稿

```ts
const newComment: CommentInsert = {
  body: 'コメント内容',
  spot_id: spotId,
  user_id: userId,
};

const { data, error } = await supabase
  .from('comments')
  .insert(newComment)
  .select()
  .single();
```

### DELETE: コメント削除

```ts
const { error } = await supabase
  .from('comments')
  .delete()
  .eq('id', commentId);
```

---

## Discoveries（発見記録）

### READ: ユーザーの発見済みスポット一覧

```ts
const { data, error } = await supabase
  .from('discoveries')
  .select('*')
  .eq('user_id', userId);
```

### CREATE: 発見を記録

```ts
const { data, error } = await supabase
  .from('discoveries')
  .insert({ spot_id: spotId, user_id: userId })
  .select()
  .single();
```

---

## よく使うフィルタ・オプション

```ts
// 複数条件
.eq('user_id', userId).eq('spot_id', spotId)

// NULL チェック
.is('image_url', null)
.not('image_url', 'is', null)

// 並び替え
.order('created_at', { ascending: false })

// 件数制限
.limit(20)

// 特定カラムだけ取得（通信量削減）
.select('id, name, lat, lng')
```

---

## エラーハンドリングのパターン

```ts
const { data, error } = await supabase.from('spots').select('*');

if (error) {
  // error.message にエラー内容が入る
  console.error('取得失敗:', error.message);
  return;
}

// この行以降、data は non-null として扱える
console.log(data);
```
