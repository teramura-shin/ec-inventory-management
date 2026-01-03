# セットアップガイド

## 1. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください。

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Encryption key for Shopify credentials (32 characters)
ENCRYPTION_KEY="your-32-character-encryption-key"

# Email (optional, for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### 環境変数の説明

- **DATABASE_URL**: PostgreSQLデータベースの接続URL
  - 例: `postgresql://postgres:password@localhost:5432/inventory_db?schema=public`
  
- **NEXTAUTH_SECRET**: NextAuth.jsのセッション暗号化用の秘密鍵
  - 生成方法: `openssl rand -base64 32` またはオンラインツールで生成

- **ENCRYPTION_KEY**: Shopify認証情報の暗号化用キー（32文字）
  - 生成方法: ランダムな32文字の文字列

## 2. PostgreSQLデータベースの作成

### 方法1: ローカルにPostgreSQLをインストール

```bash
# macOS (Homebrew)
brew install postgresql@14
brew services start postgresql@14

# データベースを作成
createdb inventory_db
```

### 方法2: Dockerを使用

```bash
docker run --name postgres-inventory \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=inventory_db \
  -p 5432:5432 \
  -d postgres:14
```

### 方法3: クラウドサービスを使用

- Supabase (無料プランあり)
- Neon (無料プランあり)
- Railway
- Heroku

## 3. データベースマイグレーション

```bash
# Prismaクライアントの生成
npm run db:generate

# データベースにスキーマを適用
npm run db:push

# または、マイグレーションファイルを作成して適用
npm run db:migrate
```

## 4. 初期データの投入

```bash
# TypeScriptを実行するためにtsxを使用
npx tsx scripts/init-db.ts
```

これにより、以下の初期データが作成されます：
- 初期ユーザー: `admin@example.com` / パスワード: `admin123`
- デフォルトのアラート設定

## 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## トラブルシューティング

### データベース接続エラー

- PostgreSQLが起動しているか確認: `pg_isready`
- DATABASE_URLが正しいか確認
- データベースが存在するか確認

### Prismaエラー

- `npm run db:generate` を再実行
- `node_modules` を削除して `npm install` を再実行

### 認証エラー

- NEXTAUTH_SECRETが設定されているか確認
- NEXTAUTH_URLが正しいか確認

