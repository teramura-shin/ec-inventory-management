# デプロイ手順

## デプロイ前の準備

### 1. ビルドの確認

```bash
npm run build
```

エラーがないことを確認してください。

### 2. 環境変数の設定

本番環境で必要な環境変数：
- `DATABASE_URL`: 本番環境のPostgreSQL接続URL
- `NEXTAUTH_URL`: 本番環境のURL（例: https://your-app.vercel.app）
- `NEXTAUTH_SECRET`: セキュリティキー（開発環境とは別のものを生成）
- `ENCRYPTION_KEY`: Shopify認証情報の暗号化キー

## デプロイ方法

### 方法1: Vercel（推奨・最も簡単）

1. **Vercelアカウントの作成**
   - https://vercel.com にアクセス
   - GitHubアカウントでサインアップ

2. **プロジェクトのインポート**
   - Vercelダッシュボードで「New Project」をクリック
   - GitHubリポジトリを選択
   - プロジェクトをインポート

3. **環境変数の設定**
   - プロジェクト設定 → Environment Variables
   - 必要な環境変数を追加

4. **データベースの設定**
   - Vercel Postgres を使用するか、外部のPostgreSQLサービスを使用
   - `DATABASE_URL` を設定

5. **デプロイ**
   - 「Deploy」ボタンをクリック
   - 自動的にデプロイが開始されます

### 方法2: Railway

1. **Railwayアカウントの作成**
   - https://railway.app にアクセス
   - GitHubアカウントでサインアップ

2. **プロジェクトの作成**
   - 「New Project」→「Deploy from GitHub repo」
   - リポジトリを選択

3. **PostgreSQLの追加**
   - 「New」→「Database」→「Add PostgreSQL」
   - 自動的に `DATABASE_URL` が設定されます

4. **環境変数の設定**
   - Variables タブで環境変数を設定

5. **デプロイ**
   - 自動的にデプロイが開始されます

### 方法3: その他のクラウドサービス

- **Render**: https://render.com
- **Fly.io**: https://fly.io
- **AWS Amplify**: https://aws.amazon.com/amplify

## デプロイ後の手順

### 1. データベースのマイグレーション

デプロイ後、本番環境のデータベースにスキーマを適用：

```bash
# 本番環境のDATABASE_URLを設定してから
npx prisma db push --skip-generate
```

または、Vercelの場合は自動的に実行されます。

### 2. 初期ユーザーの作成

本番環境で初期ユーザーを作成する必要があります。

### 3. Shopify連携の設定

1. 設定画面（/settings）にアクセス
2. Shopify連携タブで認証情報を入力
3. 「接続テスト」で接続を確認
4. 「在庫同期」で商品情報をインポート

## 注意事項

- 本番環境では必ず強力なパスワードを使用してください
- Shopify認証情報は暗号化して保存することを推奨します（現在は平文保存）
- HTTPSを使用してください（Vercel、Railwayは自動でHTTPS対応）
- 定期的なバックアップを設定してください

