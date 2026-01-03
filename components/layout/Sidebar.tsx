"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
} from "lucide-react"

const navigation = [
  { name: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { name: "商品管理", href: "/products", icon: Package },
  { name: "在庫管理", href: "/inventory", icon: Warehouse },
  { name: "在庫アラート", href: "/alerts", icon: Bell },
  { name: "売れ筋商品", href: "/bestsellers", icon: TrendingUp },
  { name: "発注管理", href: "/purchase-orders", icon: ShoppingCart },
  { name: "発注先管理", href: "/suppliers", icon: ShoppingCart },
  { name: "設定", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">在庫管理システム</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span>ログアウト</span>
        </button>
      </div>
    </div>
  )
}

