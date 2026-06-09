# マナビジョン風 ログインページ (Next.js)

マナビジョンのログイン画面を Next.js + NextAuth.js で再現したプロジェクトです。

## 機能

- ✅ ログインID（SASSI番号 or メールアドレス）＋パスワード認証
- ✅ パスワード表示/非表示トグル
- ✅ エラーメッセージ表示
- ✅ Googleログイン（環境変数を設定した場合のみ表示）
- ✅ ログイン後のメンバーページ（セッション保護）
- ✅ レスポンシブ対応

## セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.local.example .env.local
# .env.local を編集してください
```

### .env.local の設定

```env
# 必須: ランダムな文字列（openssl rand -base64 32 で生成）
NEXTAUTH_SECRET=your-secret-here

# 本番環境のURL
NEXTAUTH_URL=https://your-app.vercel.app

# Google ログインを使う場合のみ（任意）
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
```

## 開発サーバー起動

```bash
npm run dev
# → http://localhost:3000
```

## Vercel デプロイ

1. GitHub にプッシュ
2. Vercel でインポート
3. **Environment Variables** に以下を設定：
   - `NEXTAUTH_SECRET`（必須）
   - `NEXTAUTH_URL`（本番URL）
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`（任意）

## テストアカウント

デモ用アカウント（`app/api/auth/[...nextauth]/route.ts` で定義）:

| ログインID | パスワード |
|---|---|
| `SASSI0000000001` | `password123` |
| `test@example.com` | `password123` |

> **本番環境ではデータベース（例: Prisma + PostgreSQL）に置き換えてください。**

## Google ログイン設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. **OAuth 2.0 クライアントID** を作成
3. 承認済みリダイレクトURIに追加：
   - `http://localhost:3000/api/auth/callback/google`（開発）
   - `https://your-app.vercel.app/api/auth/callback/google`（本番）
4. Client ID / Secret を `.env.local` に設定

## ファイル構成

```
├── app/
│   ├── api/auth/[...nextauth]/route.ts   # NextAuth設定・認証ロジック
│   ├── login/page.tsx                    # ログインページ（サーバー）
│   ├── member/page.tsx                   # メンバーページ（要認証）
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── LoginForm.tsx                     # ログームフォーム（クライアント）
│   ├── LoginForm.module.css
│   ├── MemberPage.tsx
│   └── MemberPage.module.css
└── .env.local.example
```
