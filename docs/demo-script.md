# dotcloak デモGIF 撮影手順書

## 撮影ツール

以下のどちらかを選ぶ。

### 推奨: vhs（シンプル）

```bash
brew install vhs
```

`.tape` ファイルに手順を書くだけで自動録画・GIF出力できる。

`vhs` が `could not open ttyd: navigation failed: net::ERR_CONNECTION_REFUSED` で落ちる場合は、このデモでは `asciinema + agg` へ切り替える。`npm link` 済みのホスト側 `dotcloak` をそのまま使えるため、Docker 版より安全に再現できる。

### 代替: asciinema + agg

```bash
brew install asciinema
brew install agg  # または: cargo install agg
```

`asciinema rec` で録画 → `agg` でGIF変換。

---

## 撮影前の準備

```bash
# 現在の作業ツリーをCLIとして使う
cd ~/workspaces/dotcloak
npm run build
npm link

# 作業用ディレクトリを作り直す
rm -rf /tmp/dotcloak-demo
mkdir -p /tmp/dotcloak-demo
cd /tmp/dotcloak-demo

# init は .env がないと失敗するので先に用意する
printf 'SECRET_KEY=bootstrap-secret\n' > .env

# 期待するCLIが見えているか確認
dotcloak --version
```

最新のローカル実装を撮るため、公開済みのグローバル版ではなく `npm link` したこのリポジトリを使う。

---

## vhs を使う場合

`[docs/demo.tape](/Users/ren0826nosuke/workspaces/dotcloak/docs/demo.tape)` をそのまま使う。

```tape
Output assets/demo.gif

Set FontSize 14
Set Width 900
Set Height 500
Set Theme "Catppuccin Mocha"
Set TypingSpeed 80ms
Set Padding 20

# --- Setup ---
Type "cd /tmp/dotcloak-demo"
Enter
Sleep 500ms

# --- Step 1: init ---
Type "dotcloak init"
Enter
Sleep 1s

# --- Step 2: set secret ---
Type "dotcloak set SECRET_KEY"
Enter
Sleep 500ms
Type "my-super-secret-api-key"
Enter
Sleep 800ms

# --- Step 3: run with injection ---
Type "dotcloak run -- node -e 'console.log(process.env.SECRET_KEY)'"
Enter
Sleep 1.5s

# --- Step 4: list ---
Type "dotcloak list"
Enter
Sleep 1s
```

実行:

```bash
cd ~/workspaces/dotcloak
vhs docs/demo.tape
# → assets/demo.gif が生成される
```

`status` でも動くが、GIF としては `list` の方が「暗号化された保管庫に秘密が入っている」ことを短時間で伝えやすい。

`vhs docs/demo.tape` が `ttyd` 接続エラーで失敗した場合は、このまま `vhs` を追わずに下の `asciinema + agg` 手順へ切り替える。

---

## asciinema を使う場合

```bash
cd /tmp/dotcloak-demo
asciinema rec demo.cast --overwrite
```

以下を順番に入力:

```
dotcloak init
dotcloak set SECRET_KEY
# プロンプトが出たら: my-super-secret-api-key
dotcloak run -- node -e 'console.log(process.env.SECRET_KEY)'
dotcloak list
```

録画終了後（Ctrl+D）、GIF変換:

```bash
agg demo.cast ~/workspaces/dotcloak/assets/demo.gif \
  --font-size 14 \
  --cols 90 \
  --rows 24
```

---

## 出力先

```
~/workspaces/dotcloak/assets/demo.gif
```

---

## 撮影のコツ

- 各コマンドの後に1〜2秒待つ（見やすいGIFになる）
- ターミナルの背景は **ダーク系**（Catppuccin Mocha / Tokyo Night など）
- フォントは Nerd Font 推奨（アイコンが出る場合）
- GIF のループは無限ループでOK
- 事前準備で `/tmp/dotcloak-demo` を作り直しておく。録画中にセットアップを見せすぎるとテンポが落ちる

---

## READMEへの挿入

撮影後、README.md の Quick Start セクションに追加:

```markdown
![dotcloak demo](assets/demo.gif)
```
