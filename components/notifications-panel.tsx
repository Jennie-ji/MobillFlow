"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, CheckCircle, Info, X, Clock, Package, TrendingUp } from "lucide-react"

interface Notification {
  id: string
  type: "warning" | "success" | "info" | "error"
  title: string
  message: string
  timestamp: string
  read: boolean
  category: "inventory" | "system" | "performance" | "alert"
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "warning",
      title: "Low Inventory Alert",
      message: "P-002 stock is running low in SINGAPORE-WAREHOUSE (890 MT remaining)",
      timestamp: "2 minutes ago",
      read: false,
      category: "inventory",
    },
    {
      id: "2",
      type: "success",
      title: "Shipment Completed",
      message: "Outbound shipment #SH-2024-001 has been successfully delivered",
      timestamp: "15 minutes ago",
      read: false,
      category: "system",
    },
    {
      id: "3",
      type: "info",
      title: "Performance Report",
      message: "Weekly performance report is now available for review",
      timestamp: "1 hour ago",
      read: true,
      category: "performance",
    },
    {
      id: "4",
      type: "error",
      title: "System Alert",
      message: "Database connection timeout detected - automatically resolved",
      timestamp: "2 hours ago",
      read: true,
      category: "alert",
    },
    {
      id: "5",
      type: "warning",
      title: "Forecast Deviation",
      message: "Actual inventory differs from forecast by 15% in CHINA-WAREHOUSE",
      timestamp: "3 hours ago",
      read: false,
      category: "performance",
    },
    {
      id: "6",
      type: "success",
      title: "Inbound Received",
      message: "New shipment of 500 MT P-001 received at CHINA-WAREHOUSE",
      timestamp: "4 hours ago",
      read: true,
      category: "inventory",
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inventory":
        return <Package className="h-4 w-4" />
      case "performance":
        return <TrendingUp className="h-4 w-4" />
      case "system":
        return <Bell className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-[#ED1B2D] to-red-600 p-3 rounded-xl">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : "All notifications read"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="border-[#ED1B2D] text-[#ED1B2D] hover:bg-[#ED1B2D] hover:text-white bg-transparent"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 ring-1 ring-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-xl font-bold text-gray-900">
                  {notifications.filter((n) => n.type === "warning" || n.type === "error").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 ring-1 ring-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-gray-900">
                  {notifications.filter((n) => n.type === "success").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 ring-1 ring-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Info</p>
                <p className="text-xl font-bold text-gray-900">
                  {notifications.filter((n) => n.type === "info").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 ring-1 ring-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Notifications List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 ring-1 ring-gray-200/50">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h2>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    notification.read ? "bg-gray-50/50 border-gray-200/50" : "bg-white border-[#ED1B2D]/20 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-medium ${notification.read ? "text-gray-700" : "text-gray-900"}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && <Badge className="bg-[#ED1B2D] hover:bg-red-600 text-xs">New</Badge>}
                          <div className="flex items-center space-x-1 text-gray-500">
                            {getCategoryIcon(notification.category)}
                            <span className="text-xs capitalize">{notification.category}</span>
                          </div>
                        </div>
                        <p className={`text-sm ${notification.read ? "text-gray-500" : "text-gray-700"}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-[#ED1B2D] hover:bg-red-50"
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
