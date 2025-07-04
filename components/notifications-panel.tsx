"use client"

import { useState, useEffect } from "react"
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
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Fetch notifications from API on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5678/webhook/get_notification");
        if (!res.ok) return;
        const data = await res.json();
        let parsed: any[] = [];
        if (Array.isArray(data) && data.length > 0 && typeof data[0].output === "string") {
          try {
            // Fix: double JSON.parse if needed
            let output = data[0].output;
            if (typeof output === "string") {
              // If output is a stringified array, parse it
              parsed = JSON.parse(output);
              // If the result is a string (double encoded), parse again
              if (typeof parsed === "string") {
                parsed = JSON.parse(parsed);
              }
            }
          } catch (e) {
            parsed = [];
          }
        }
        if (!Array.isArray(parsed)) parsed = [];
        const mapped: Notification[] = parsed.map((item, idx) => ({
          id: (idx + 1).toString(),
          type: item.topic.toLowerCase().includes("alert") ? "warning" : "info",
          title: item.topic || "Notification",
          message: item.Description || "",
          timestamp: item.date || "",
          read: false,
          category: item.warehouse && item.warehouse.toLowerCase().includes("china")
            ? "inventory"
            : item.warehouse && item.warehouse.toLowerCase().includes("singapore")
            ? "inventory"
            : item.topic && item.topic.toLowerCase().includes("report")
            ? "performance"
            : "alert",
        }));
        setNotifications(mapped);
      } catch (e) {
        // fallback: do nothing
      }
    };
    fetchNotifications();
  }, []);

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
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No notifications available</p>
                </div>
              ) : (
                notifications.map((notification) => (
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
                          <p className={`text-sm ${notification.read ? "text-gray-500" : "text-gray-700"} whitespace-pre-wrap`}>
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
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}