import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  try {
    // NextAuth.js v5では、signInはクライアント側から呼び出す必要があります
    // このAPIルートは削除して、クライアント側で直接signInを呼び出すように変更します
    return NextResponse.json(
      { error: "このエンドポイントは使用されていません。クライアント側でsignInを使用してください。" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "ログインに失敗しました" },
      { status: 500 }
    )
  }
}

