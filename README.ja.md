<p align="center">
  <img src="assets/logo.png" alt="dotcloak" width="400" />
</p>

<p align="center">
  日本語 | <a href="./README.md">English</a>
</p>

[![CI](https://github.com/3062-in-zamud/dotcloak/actions/workflows/ci.yml/badge.svg)](https://github.com/3062-in-zamud/dotcloak/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/dotcloak.svg)](https://www.npmjs.com/package/dotcloak)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# dotcloak

> `.env` を暗号化して、AI コーディングツールに暗号文しか見せない。

dotcloak は Node.js 製の CLI ツールです。`.env` ファイルを [age](https://age-encryption.org/) で暗号化し、`dotcloak run` で起動したプロセスにだけ平文のシークレットを注入します。

- リポジトリ: <https://github.com/3062-in-zamud/dotcloak>
- Node.js: `>=20`
- ライセンス: MIT

## クイックスタート

![dotcloak demo](assets/demo.gif)

```bash
npm install -g dotcloak

cat > .env <<'EOF'
API_KEY=super-secret
DATABASE_URL=postgres://localhost/app
EOF

dotcloak init
dotcloak status
dotcloak run -- node -e "console.log(process.env.API_KEY)"
```

何が起きるか:

1. `dotcloak init` が `.env.cloak`、`.dotcloak/key.age`、`.dotcloak/config.toml` を生成します。
2. `.dotcloak/key.age` を `.gitignore`、`.claudeignore`、`.cursorignore` に自動追記します。
3. 元の `.env` は `--keep` を渡さない限り削除されます。
4. `dotcloak run` はメモリ上でシークレットを復号し、起動するコマンドに渡します。

グローバルインストールなしで使う場合:

```bash
npx dotcloak init
npx dotcloak run -- npm start
```

## CLI フロー

```text
.env
  -> dotcloak init
  -> .env.cloak + .dotcloak/key.age
  -> dotcloak run -- <コマンド>
  -> 子プロセスが process.env を受け取る
```

## コマンドリファレンス

### `dotcloak init`

平文の `.env` を暗号化して、dotcloak をプロジェクトに初期化します。

```bash
dotcloak init
dotcloak init --keep        # .env を削除せず残す
dotcloak init --file .env.local
```

### `dotcloak run -- <コマンド>`

シークレットを復号して子プロセスの環境変数に注入しながらコマンドを実行します。

```bash
dotcloak run -- npm start
dotcloak run -- node -e "console.log(process.env.API_KEY)"
dotcloak run --file .env.production.cloak -- npm run worker
```

### `dotcloak set`

暗号化ストアにシークレットを追加・更新します。

```bash
dotcloak set API_KEY=rotated-secret
dotcloak set DATABASE_URL   # プロンプトで非表示入力
```

### `dotcloak unset`

暗号化ストアからシークレットを削除します。

```bash
dotcloak unset API_KEY
```

### `dotcloak list`

暗号化ストアのシークレット一覧を表示します。

```bash
dotcloak list
dotcloak list --show   # 平文で表示（信頼できる端末のみで使用）
```

### `dotcloak edit`

`$EDITOR` または `$VISUAL` でシークレットを編集し、保存時に再暗号化します。

```bash
EDITOR=nvim dotcloak edit
VISUAL="code --wait" dotcloak edit
```

### `dotcloak status`

dotcloak の初期化状態と、平文 `.env` の残存有無を表示します。

```bash
dotcloak status
```

### `dotcloak key export`

現在の age 秘密鍵を出力します。バックアップや安全な転送に使用します。

```bash
dotcloak key export > dotcloak-backup.age
```

### `dotcloak key import`

エクスポートした age 秘密鍵をプロジェクトにインポートします。

```bash
dotcloak key import ./dotcloak-backup.age
```

## セキュリティモデル

### dotcloak が守るもの

- `dotcloak init` 後、平文 `.env` をディスクに残す必要がありません。
- AI コーディングツールがファイルシステムをスキャンしても、見えるのは暗号化された `.env.cloak` のみです。
- アプリは `process.env` をそのまま使えます。コードの変更は不要です。

### dotcloak が守らないもの

- `dotcloak run` で起動したプロセス自身からシークレットを守ることはできません。
- OS レベルの分離、シークレットのローテーション、ホスト強化の代替にはなりません。
- プロセスメモリや環境変数をすでに覗ける攻撃者から守ることはできません。

### Linux に関する注意

`dotcloak run` はシークレットを子プロセスの環境変数に注入します。これはファイルシステムベースの AI スキャンからは守れますが、同一ユーザーによる `/proc/<pid>/environ` などの OS レベルのプロセス検査には対応していません。dotcloak はファイルシステム保護であり、サンドボックス境界ではありません。

## なぜ AI ツール対策に有効か

`.aiignore` や `.cursorignore` などの無視ファイルはあくまで「推奨」にすぎず、ツールが必ず従うとは限りません。dotcloak はディスク上のファイル自体を暗号文に置き換えます。AI ツールが読めるのは暗号文のみ。これが dotcloak が解決する唯一の問題です。

## 開発に参加する

- コントリビューションガイド: [CONTRIBUTING.md](./CONTRIBUTING.md)
- リリースチェックリスト: [RELEASING.md](./RELEASING.md)
- セキュリティ: [SECURITY.md](./SECURITY.md)

## ライセンス

[MIT](./LICENSE)
