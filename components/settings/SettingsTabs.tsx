"use client"

import { useState } from "react"
import AlertSettings from "./AlertSettings"
import ShopifySettings from "./ShopifySettings"

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<"alerts" | "shopify">("alerts")

  return (
    <div>
      {/* タブ */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "alerts"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            アラート設定
          </button>
          <button
            onClick={() => setActiveTab("shopify")}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "shopify"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Shopify連携
          </button>
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="mt-6">
        {activeTab === "alerts" && <AlertSettings />}
        {activeTab === "shopify" && <ShopifySettings />}
      </div>
    </div>
  )
}

