"use client"

import { MessageSquare, BarChart3, Database, Warehouse } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: "chat" | "dashboard" | "database") => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: "chat", label: "Chat with Emmie", icon: MessageSquare },
    { id: "dashboard", label: "AI Dashboard", icon: BarChart3 },
    { id: "database", label: "Database", icon: Database },
  ]

  return (
    <div className="w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 flex flex-col shadow-xl">
      {/* Logo - ปรับปรุงให้สวยขึ้น */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ED1B2D] to-red-600 rounded-xl blur opacity-75"></div>
            <div className="relative bg-gradient-to-r from-[#ED1B2D] to-red-600 p-2 rounded-xl shadow">
              <Warehouse className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#ED1B2D] to-red-600 bg-clip-text text-transparent">
              MobilFlow
            </h2>
            <p className="text-sm text-gray-600 font-medium">Warehouse Management</p>
          </div>
        </div>
      </div>

      {/* Navigation - ปรับปรุงให้สวยขึ้น */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id as any)}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-[#ED1B2D] to-red-600 text-white shadow-lg transform scale-105"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-[#ED1B2D] hover:shadow-md hover:scale-102",
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
                  )}
                  <Icon className={cn("h-5 w-5 mr-3 relative z-10", isActive ? "text-white" : "text-gray-500")} />
                  <span className="relative z-10 font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer - ปรับปรุงให้สวยขึ้น */}
      <div className="p-4 border-t border-gray-200/50">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 font-medium">© 2025 MobillFlow</p>
          <p className="text-xs text-gray-400 mt-1">Powered by Great player good team</p>
        </div>
      </div>
    </div>
  )
}
