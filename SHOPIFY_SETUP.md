# Shopify連携設定ガイド（最新版）

## 重要なお知らせ

**2026年1月1日以降、レガシーカスタムアプリの新規作成ができなくなりました。**
新しいカスタムアプリは**Dev Dashboard**で作成する必要があります。

参考: [Shopify Dev Dashboard](https://shopify.dev/docs/apps/build/dev-dashboard)

## 最新の設定手順

### 1. Dev Dashboardにアクセス

1. **Dev Dashboardにログイン**
   - https://dev.shopify.com/dashboard にアクセス
   - Shopifyアカウントでログイン

2. **または、Shopify管理画面から**
   - Shopify管理画面にログイン
   - 右上のストア名をクリック
   - 「Dev Dashboard」を選択

### 2. カスタムアプリの作成

1. **Dev Dashboardでアプリを作成**
   - 「Create app」または「アプリを作成」をクリック
   - 「Create custom app」を選択
   - アプリ名を入力（例: `在庫管理システム`）
   - 「Create app」をクリック

2. **API認証情報の取得**
   - 作成したアプリの詳細ページを開く
   - 「API credentials」または「API認証情報」セクションを確認
   - 以下の情報を取得：
     - **Client ID** (APIキー)
     - **Client Secret** (APIシークレット)

### 3. Admin APIアクセストークンの取得

1. **アクセストークンの生成**
   - アプリの詳細ページで「Admin API access scopes」または「Admin APIアクセススコープ」を開く
   - 必要なスコープを選択：
     - `read_products` - 商品情報の読み取り
     - `read_inventory` - 在庫情報の読み取り
     - `write_inventory` - 在庫情報の書き込み（必要に応じて）
     - `read_orders` - 注文情報の読み取り（売上履歴用、推奨）
   - 「Save」をクリック

2. **アクセストークンの生成**
   - 「Install app」または「アプリをインストール」をクリック
   - ストアを選択してインストール
   - インストール後、**Admin API access token**が生成されます
   - このトークンをコピー（一度しか表示されないため、必ず保存）

### 4. 必要なスコープ（権限）

以下のスコープが必要です：

- **`read_products`** - 商品情報の読み取り（必須）
- **`read_inventory`** - 在庫情報の読み取り（必須）
- **`write_inventory`** - 在庫情報の書き込み（在庫更新が必要な場合）
- **`read_orders`** - 注文情報の読み取り（売上履歴分析用、推奨）

### 5. 在庫管理システムでの設定

1. **デプロイされたURLにアクセス**
   - 例: `https://your-app.vercel.app`

2. **設定画面を開く**
   - 「設定」→「Shopify設定」を開く

3. **情報を入力**
   - **ストア名**: ShopifyストアのURL（例: `your-store`）
     - 注意: `myshopify.com`は不要。`your-store`のみ入力
   - **APIキー**: Dev Dashboardで取得したClient ID
   - **APIシークレット**: Dev Dashboardで取得したClient Secret
   - **アクセストークン**: インストール後に生成されたAdmin API access token
   - **Webhookシークレット**: Webhookを使用する場合のみ（オプション）

4. **接続テスト**
   - 「接続テスト」ボタンをクリック
   - 成功メッセージが表示されれば設定完了

5. **在庫同期**
   - 「在庫同期」ボタンをクリック
   - Shopifyから商品と在庫情報が同期されます

## 注意事項

### セキュリティ

- **APIシークレット**と**アクセストークン**は機密情報です
- 一度しか表示されないため、必ず安全に保存してください
- 他人に共有しないでください

### APIレート制限

- Shopify Admin APIにはレート制限があります
- 大量の商品がある場合、同期に時間がかかる場合があります
- エラーが発生した場合は、しばらく待ってから再試行してください

### 本番環境

- 本番環境では、HTTPSを使用してください（Vercelは自動でHTTPS）
- 環境変数で機密情報を管理することを推奨します

## トラブルシューティング

### 接続テストが失敗する場合

1. **ストア名が正しいか確認**
   - `your-store.myshopify.com`の`your-store`部分のみ入力
   - `https://`や`.myshopify.com`は不要

2. **アクセストークンが正しいか確認**
   - アクセストークンは、アプリをインストールした後に生成されます
   - 再生成する場合は、アプリを再インストールする必要があります

3. **スコープが正しく設定されているか確認**
   - 必要なスコープ（`read_products`, `read_inventory`など）が有効になっているか確認

4. **APIバージョンを確認**
   - 現在のコードは`2024-01`バージョンを使用しています
   - 最新のAPIバージョンに更新する場合は、コードの修正が必要です

## 参考リンク

- [Shopify Dev Dashboard](https://shopify.dev/docs/apps/build/dev-dashboard)
- [Shopify Admin API](https://shopify.dev/docs/api/admin)
- [Shopify API認証](https://shopify.dev/docs/apps/auth)

