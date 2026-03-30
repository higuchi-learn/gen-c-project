# キャッシュバスティング（Cache Busting）

## 概要

同一 URL のリソースを更新したとき、ブラウザや CDN が古いキャッシュを返し続ける問題を防ぐ手法。
URL にクエリパラメータを付与することで「別のリソース」と認識させ、強制的に再取得させる。

---

## なぜキャッシュが問題になるか

ブラウザや CDN は **URL をキー** としてリソースを保存する。
同じ URL へのリクエストは保存済みデータをそのまま返すため、サーバー側のファイルが更新されても反映されない。

```txt
1回目の取得: https://.../avatar.png  →  🐱（保存）
ファイルを 🐶 に更新
2回目の取得: https://.../avatar.png  →  🐱（キャッシュから返る）← 問題
```

---

## このプロジェクトで発生した箇所

アバター画像のアップロードパスが固定のため、画像を更新しても URL が変わらずキャッシュが残り続けた。

```ts
// src/components/ui/AvaterUpload-setup.tsx
const filePath = `${userId}/avatar.${fileExt}`;  // 常に同じパス（上書き保存）
```

---

## 対処法：クエリパラメータにタイムスタンプを付与

```ts
const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
```

`Date.now()` はミリ秒単位の現在時刻（例: `1700000099999`）を返す。
アップロードのたびに値が変わるため、URL が毎回変わりキャッシュがスキップされる。

```txt
更新前の取得: https://.../avatar.png?t=1700000000000  →  🐱（キャッシュ）
更新後の取得: https://.../avatar.png?t=1700000099999  →  🐶（サーバーから再取得）✅
```

---

## バリデーションへの影響

`profile-setup.tsx` ではアップロード先 URL のバリデーションを行っているが、
`startsWith()` を使っているため `?t=...` を付けても問題なくパスする。

```ts
const SUPABASE_AVATAR_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/`;

url.startsWith(SUPABASE_AVATAR_BASE)
// https://.../avatars/user123/avatar.png?t=1700000099999
// → startsWith でベース部分だけ確認するため ✅
```

---

## 他の対処法との比較

| 手法 | 概要 | 備考 |
|---|---|---|
| クエリパラメータ（今回の方法） | URL に `?t=タイムスタンプ` を付与 | シンプル・コード変更のみ |
| ファイル名にバージョンを含める | `avatar_v2.png` のように命名 | Storage に古いファイルが残る |
| Cache-Control ヘッダー | サーバー側でキャッシュ期間を制御 | Supabase Storage の設定が必要 |
