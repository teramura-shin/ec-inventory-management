#!/usr/bin/env node

/**
 * セキュリティキーを生成するスクリプト
 * 実行方法: npx tsx scripts/generate-secrets.ts
 */

import crypto from "crypto"

function generateSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString("base64")
}

function generateHex(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

console.log("=".repeat(60))
console.log("セキュリティキー生成")
console.log("=".repeat(60))
console.log()
console.log("NEXTAUTH_SECRET:")
console.log(generateSecret(32))
console.log()
console.log("ENCRYPTION_KEY (32文字):")
console.log(generateHex(16)) // 16バイト = 32文字のhex
console.log()
console.log("=".repeat(60))
console.log("これらの値を.envファイルにコピーしてください")
console.log("=".repeat(60))

