"use client";

import { useState } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Clock,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: "warning" | "success" | "info" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: "inventory" | "system" | "performance" | "alert";
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "warning",
      title: "Low Inventory Alert",
      message: "P-002 stock is running low in SINGAPORE-WAREHOUSE",
      timestamp: "2 minutes ago",
      read: false,
      category: "inventory",
    },
    {
      id: "2",
      type: "success",
      title: "Shipment Completed",
      message: "Outbound shipment #SH-2024-001 has been delivered",
      timestamp: "15 minutes ago",
      read: false,
      category: "system",
    },
    {
      id: "3",
      type: "info",
      title: "Performance Report",
      message: "Weekly performance report is now available",
      timestamp: "1 hour ago",
      read: true,
      category: "performance",
    },
    {
      id: "4",
      type: "error",
      title: "System Alert",
      message: "Database connection timeout detected",
      timestamp: "2 hours ago",
      read: true,
      category: "alert",
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inventory":
        return <Package className="h-3 w-3" />;
      case "performance":
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="leading-8" asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 hover:from-red-50 hover:to-pink-50"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#ED1B2D] text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 bg-white/95 backdrop-blur-sm border-gray-200/50"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <DropdownMenuLabel className="text-base font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-[#ED1B2D] hover:bg-red-50 hover:text-red-600"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b border-gray-100 last:border-0 ${
                  notification.read ? "bg-white" : "bg-red-50/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <Badge className="bg-[#ED1B2D] hover:bg-red-600 text-[10px]">
                            New
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                        <Clock className="h-3 w-3" />
                        <span>{notification.timestamp}</span>
                        <span className="mx-1">•</span>
                        {getCategoryIcon(notification.category)}
                        <span className="capitalize">
                          {notification.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 text-[10px] text-[#ED1B2D] hover:bg-red-50 hover:text-red-600 px-2"
                          >
                            Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
