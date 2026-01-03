"use client"

import { useState, useEffect } from "react"

export default function AlertSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    alertThresholdWeeks: 2,
    emailNotification: false,
    emailAddress: "",
    lineNotification: false,
    lineWebhookUrl: "",
    slackNotification: false,
    slackWebhookUrl: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/alerts")
      const data = await response.json()

      if (response.ok && data.setting) {
        setFormData({
          alertThresholdWeeks: data.setting.alertThresholdWeeks,
          emailNotification: data.setting.emailNotification,
          emailAddress: data.setting.emailAddress || "",
          lineNotification: data.setting.lineNotification,
          lineWebhookUrl: data.setting.lineWebhookUrl || "",
          slackNotification: data.setting.slackNotification,
          slackWebhookUrl: data.setting.slackWebhookUrl || "",
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

    try {
      const response = await fetch("/api/settings/alerts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert("設定を保存しました")
      } else {
        alert(data.error || "設定の保存に失敗しました")
      }
    } catch (error) {
      alert("設定の保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">アラート基準</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            アラート基準週数
          </label>
          <input
            type="number"
            min="1"
            value={formData.alertThresholdWeeks}
            onChange={(e) =>
              setFormData({
                ...formData,
                alertThresholdWeeks: parseInt(e.target.value) || 2,
              })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            在庫切れまでの週数がこの値未満になった場合、アラートを発動します
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">通知設定</h2>

        <div className="space-y-4">
          {/* メール通知 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.emailNotification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailNotification: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                メール通知
              </span>
            </label>
            {formData.emailNotification && (
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) =>
                  setFormData({ ...formData, emailAddress: e.target.value })
                }
                placeholder="通知先メールアドレス"
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            )}
          </div>

          {/* LINE通知 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.lineNotification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lineNotification: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                LINE通知
              </span>
            </label>
            {formData.lineNotification && (
              <input
                type="url"
                value={formData.lineWebhookUrl}
                onChange={(e) =>
                  setFormData({ ...formData, lineWebhookUrl: e.target.value })
                }
                placeholder="LINE Webhook URL"
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            )}
          </div>

          {/* Slack通知 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.slackNotification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slackNotification: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Slack通知
              </span>
            </label>
            {formData.slackNotification && (
              <input
                type="url"
                value={formData.slackWebhookUrl}
                onChange={(e) =>
                  setFormData({ ...formData, slackWebhookUrl: e.target.value })
                }
                placeholder="Slack Webhook URL"
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            )}
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
      </div>
    </form>
  )
}

