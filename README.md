# EC 在庫管理最適化ツール

EC 販売における在庫管理の最適化を目的とした Web アプリケーション。

## 機能

- 商品管理
- 在庫管理
- 在庫切れまでの週数算出
- 在庫アラート機能
- Shopify 連携
- 発注管理

## 技術スタック

- Next.js 14+ (App Router)
- TypeScript
- PostgreSQL
- Prisma
- NextAuth.js
- Tailwind CSS
- shadcn/ui

## セットアップ

詳細なセットアップ手順は [SETUP.md](./SETUP.md) を参照してください。

### クイックスタート

1. **依存関係のインストール**

```bash
npm install
```

2. **環境変数の設定**

```bash
# セキュリティキーを生成
npm run generate-secrets

# env.templateをコピーして.envを作成
cp env.template .env

# .envファイルを編集して、生成したキーとデータベースURLを設定
```

3. **データベースのセットアップ**

```bash
# Prismaクライアントの生成
npm run db:generate

# データベースにスキーマを適用
npm run db:push

# 初期データの投入（初期ユーザー作成）
npm run db:init
```

4. **開発サーバーの起動**

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 初期ログイン情報

- メールアドレス: `admin@example.com`
- パスワード: `admin123`

**重要**: 本番環境では必ずパスワードを変更してください。

## プロジェクト構造

```
.
├── app/              # Next.js App Router
├── components/       # Reactコンポーネント
├── lib/              # ユーティリティ関数
├── prisma/           # Prismaスキーマ
├── public/           # 静的ファイル
└── types/            # TypeScript型定義
```

## 開発フェーズ

1. ✅ プロジェクト初期化
2. ⏳ 認証機能
3. ⏳ 商品管理機能
4. ⏳ 在庫管理機能
5. ⏳ 在庫最適化機能
6. ⏳ Shopify 連携
7. ⏳ 発注管理機能
8. ⏳ 通知機能
