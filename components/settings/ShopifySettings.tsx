"use client"

import { useState, useEffect } from "react"

export default function ShopifySettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [formData, setFormData] = useState({
    storeName: "",
    apiKey: "",
    apiSecret: "",
    accessToken: "",
    webhookSecret: "",
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/shopify/settings")
      const data = await response.json()

      if (response.ok && data.setting) {
        setFormData({
          storeName: data.setting.storeName || "",
          apiKey: data.setting.apiKey === "***" ? "" : data.setting.apiKey || "",
          apiSecret: data.setting.apiSecret === "***" ? "" : data.setting.apiSecret || "",
          accessToken: data.setting.accessToken === "***" ? "" : data.setting.accessToken || "",
          webhookSecret: data.setting.webhookSecret || "",
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/shopify/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "設定を保存しました" })
        // 保存後は既存の値をクリア（セキュリティのため）
        setFormData({
          ...formData,
          apiKey: "",
          apiSecret: "",
          accessToken: "",
        })
      } else {
        setMessage({ type: "error", text: data.error || "設定の保存に失敗しました" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "設定の保存に失敗しました" })
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/shopify/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
      } else {
        setMessage({ type: "error", text: data.error || "接続テストに失敗しました" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "接続テストに失敗しました" })
    } finally {
      setTesting(false)
    }
  }

  const handleSync = async () => {
    if (!confirm("Shopifyから在庫情報を同期しますか？")) return

    setSyncing(true)
    setMessage(null)

    try {
      const response = await fetch("/api/shopify/sync", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: `${data.message} (同期: ${data.syncedCount}件, 新規: ${data.createdCount}件, 更新: ${data.updatedCount}件)`,
        })
      } else {
        setMessage({ type: "error", text: data.error || "同期に失敗しました" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "同期に失敗しました" })
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Shopify連携設定</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ストア名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) =>
                  setFormData({ ...formData, storeName: e.target.value })
                }
                placeholder="your-store (myshopify.comは不要)"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                例: your-store (https://your-store.myshopify.com の場合)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                APIキー <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={formData.apiKey}
                onChange={(e) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                APIシークレット <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={formData.apiSecret}
                onChange={(e) =>
                  setFormData({ ...formData, apiSecret: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                アクセストークン
              </label>
              <input
                type="password"
                value={formData.accessToken}
                onChange={(e) =>
                  setFormData({ ...formData, accessToken: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                OAuth認証を使用する場合のみ入力
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Webhookシークレット
              </label>
              <input
                type="password"
                value={formData.webhookSecret}
                onChange={(e) =>
                  setFormData({ ...formData, webhookSecret: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !formData.storeName}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {testing ? "テスト中..." : "接続テスト"}
          </button>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {syncing ? "同期中..." : "在庫同期"}
          </button>
        </div>
      </form>
    </div>
  )
}

