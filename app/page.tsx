"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatWithEmmie } from "@/components/chat-with-emmie"
import { AIDashboard } from "@/components/enhanced-ai-dashboard"
import { DatabaseViewer } from "@/components/database-viewer"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

type ActiveSection = "chat" | "dashboard" | "database"

export default function Home() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("chat")

  const renderActiveSection = () => {
    switch (activeSection) {
      case "chat":
        return <ChatWithEmmie />
      case "dashboard":
        return <AIDashboard />
      case "database":
        return <DatabaseViewer />
      default:
        return <ChatWithEmmie />
    }
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      case "chat":
        return "Emmie – AI Warehouse Assistant"
      case "dashboard":
        return "AI Dashboard – Customize Your View"
      case "database":
        return "Database Viewer"
      default:
        return "MobilFlow"
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {getSectionTitle()}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeSection === "chat" && "Chat with your AI assistant"}
              {activeSection === "dashboard" && "Build and customize your dashboard"}
              {activeSection === "database" && "View and manage your data"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">{renderActiveSection()}</main>
      </div>
    </div>
  )
}
