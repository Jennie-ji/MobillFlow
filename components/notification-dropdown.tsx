"use client"

import { useState, useEffect } from "react"
// ReadMore/NotificationMessage component for long messages
const NotificationMessage = ({ message }: { message: string }) => {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 120;
  if (!message) return null;
  const isLong = message.length > maxLength;
  return (
    <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">
      {expanded || !isLong ? message : message.slice(0, maxLength) + "..."}
      {isLong && !expanded && (
        <button
          className="ml-1 text-[#ED1B2D] underline hover:text-red-700 text-xs font-medium"
          onClick={() => setExpanded(true)}
          type="button"
        >
          Read more
        </button>
      )}
      {isLong && expanded && (
        <button
          className="ml-1 text-gray-500 underline hover:text-gray-700 text-xs font-medium"
          onClick={() => setExpanded(false)}
          type="button"
        >
          Show less
        </button>
      )}
    </p>
  );
};
import { usePathname } from "next/navigation"
import { Bell, AlertTriangle, CheckCircle, Info, X, Clock, Package, TrendingUp, Warehouse } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string;
  type: "warning" | "success" | "info" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: "inventory" | "system" | "performance" | "alert";
  warehouse?: string;
}

// Interface for the webhook response
interface WebhookNotification {
  topic: string;
  Description: string;
  warehouse: string;
  date: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Fetch notifications from n8n webhook
  const fetchNotifications = async () => {
    console.log("🔄 Starting fetchNotifications...");
    setLoading(true);
    
    try {
      console.log("📡 Making request to: http://localhost:5678/webhook/get_notification");
      
      const res = await fetch("http://localhost:5678/webhook/get_notification", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      console.log("📥 Response status:", res.status);
      console.log("📥 Response headers:", Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        console.error("❌ Failed to fetch notifications:", res.status, res.statusText);
        
        // Try to get error response body
        try {
          const errorText = await res.text();
          console.error("❌ Error response body:", errorText);
        } catch (e) {
          console.error("❌ Could not read error response body");
        }
        
        // Set some test notifications for debugging
        console.log("🧪 Setting test notifications due to API error");
        setNotifications([
          {
            id: "test-1",
            type: "error",
            title: "INVENTORY_SHELF_LIFE_ALERT AT SINGAPORE-WAREHOUSE",
            message: "Critical inventory alert: Multiple high-value items exceed shelf life. 1) MAT-0293 (1.43M SGD, 18 months overdue)",
            timestamp: "1 กรกฎาคม 2567",
            read: false,
            category: "inventory",
            warehouse: "SINGAPORE-WAREHOUSE",
          },
          {
            id: "test-2",
            type: "error",
            title: "INVENTORY_SHELF_LIFE_ALERT AT CHINA-WAREHOUSE",
            message: "Critical inventory alert: Multiple high-value items exceed shelf life. 1) MAT-0293 (1.43M SGD, 18 months overdue)",
            timestamp: "1 กรกฎาคม 2567",
            read: false,
            category: "inventory",
            warehouse: "CHINA-WAREHOUSE",
          },
          {
            id: "test-3",
            type: "info",
            title: "WAREHOUSE_REPORT_SUMMARY",
            message: "China Warehouse: 15,510 entries, 9,711,560,959 CNY. Singapore Warehouse: 12,818 entries, 734,170,938 SGD",
            timestamp: "1 กรกฎาคม 2567",
            read: false,
            category: "performance",
            warehouse: "CHINA-WAREHOUSE, SINGAPORE-WAREHOUSE",
          }
        ]);
        return;
      }
      
      const data = await res.json();
      console.log("📋 Raw webhook response:", data);
      console.log("📋 Response type:", typeof data);
      console.log("📋 Is array:", Array.isArray(data));
      
      if (Array.isArray(data) && data.length > 0) {
        console.log("📋 First item:", data[0]);
        console.log("📋 First item output:", data[0].output);
        console.log("📋 First item output type:", typeof data[0].output);
      }
      
      let parsedNotifications: WebhookNotification[] = [];
      
      // Handle different response structures
      let output = null;
      
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        // Case 1: Array with output property
        output = data[0].output;
        console.log("🔧 Found array format with output:", output);
      } else if (data && typeof data === 'object' && data.output) {
        // Case 2: Direct object with output property  
        output = data.output;
        console.log("🔧 Found object format with output:", output);
      } else if (Array.isArray(data)) {
        // Case 3: Direct array
        parsedNotifications = data;
        console.log("🔧 Found direct array:", parsedNotifications);
      } else {
        console.log("⚠️ Unexpected response structure");
        console.log("⚠️ Data:", data);
        
        // Set warning notification
        setNotifications([
          {
            id: "structure-warning",
            type: "warning",
            title: "Unexpected Response",
            message: "Webhook returned unexpected data structure",
            timestamp: new Date().toLocaleDateString('th-TH'),
            read: false,
            category: "alert",
          }
        ]);
        return;
      }
      
      // Parse the output if we have it
      if (output && parsedNotifications.length === 0) {
        try {
          console.log("🔧 Processing output:", output);
          console.log("🔧 Output type:", typeof output);
          
          // Handle double-encoded JSON string
          if (typeof output === "string") {
            console.log("🔧 Parsing string output...");
            parsedNotifications = JSON.parse(output);
            console.log("🔧 Parsed result:", parsedNotifications);
          } else if (Array.isArray(output)) {
            console.log("🔧 Output is already array");
            parsedNotifications = output;
          }
        } catch (parseError) {
          console.error("❌ Error parsing notifications:", parseError);
          console.error("❌ Failed to parse:", output);
          
          // Set error notification
          setNotifications([
            {
              id: "parse-error",
              type: "error",
              title: "Parse Error",
              message: `Failed to parse webhook response: ${typeof parseError === "object" && parseError && "message" in parseError ? (parseError as { message: string }).message : String(parseError)}`,
              timestamp: new Date().toLocaleDateString('th-TH'),
              read: false,
              category: "alert",
            }
          ]);
          return;
        }
      }
      
      if (!Array.isArray(parsedNotifications)) {
        console.error("❌ Expected array of notifications, got:", typeof parsedNotifications);
        console.error("❌ Value:", parsedNotifications);
        return;
      }
      
      console.log("✅ Parsed notifications array:", parsedNotifications);
      console.log("✅ Number of notifications:", parsedNotifications.length);
      
      // Map webhook data to notification interface
      const mappedNotifications: Notification[] = parsedNotifications.map((item, idx) => {
        console.log(`🔄 Processing notification ${idx + 1}:`, item);

        const isInventoryAlert = item.topic?.toLowerCase().includes("inventory");
        const isWarehouseReport = item.topic?.toLowerCase().includes("report");
        const isShelfLifeAlert = item.topic?.toLowerCase().includes("shelf_life");

        // Explicitly type the notification type
        let notifType: "error" | "warning" | "info" | "success" = "info";
        if (isShelfLifeAlert) {
          notifType = "error";
        } else if (isInventoryAlert) {
          notifType = "warning";
        } else if (isWarehouseReport) {
          notifType = "info";
        }

        const mapped: Notification = {
          id: `notif-${idx + 1}`,
          type: notifType,
          title: item.topic || "Notification",
          message: item.Description || "",
          timestamp: item.date || new Date().toLocaleDateString('th-TH'),
          read: false,
          category: isInventoryAlert ? "inventory" : isWarehouseReport ? "performance" : "alert",
          warehouse: item.warehouse,
        };

        console.log(`✅ Mapped notification ${idx + 1}:`, mapped);
        return mapped;
      });
      
      console.log("✅ All mapped notifications:", mappedNotifications);
      setNotifications(mappedNotifications);
      
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      if (typeof error === "object" && error !== null && "message" in error) {
        console.error("❌ Error details:", (error as { message: string }).message);
        console.error("❌ Error stack:", (error as { stack?: string }).stack);
      } else {
        console.error("❌ Error details:", error);
      }
      
      // Set error notification
      setNotifications([
        {
          id: "fetch-error",
          type: "error",
          title: "Network Error",
          message: `Failed to fetch notifications: ${typeof error === "object" && error && "message" in error ? (error as { message: string }).message : String(error)}`,
          timestamp: new Date().toLocaleDateString('th-TH'),
          read: false,
          category: "alert",
        }
      ]);
    } finally {
      setLoading(false);
      console.log("🏁 fetchNotifications completed");
    }
  };

  // Fetch notifications on component mount and pathname changes
  useEffect(() => {
    fetchNotifications();
  }, [pathname]);

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
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inventory":
        return <Package className="h-3 w-3" />
      case "performance":
        return <TrendingUp className="h-3 w-3" />
      default:
        return <Bell className="h-3 w-3" />
    }
  }

  const getWarehouseIcon = (warehouse?: string) => {
    if (!warehouse) return null;
    return <Warehouse className="h-3 w-3" />
  }

  const formatWarehouse = (warehouse?: string) => {
    if (!warehouse) return "";
    return warehouse.replace("-WAREHOUSE", "").replace("-", " ");
  }

  const unreadCount = notifications.filter((n) => !n.read).length

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
      <DropdownMenuContent align="end" className="w-80 p-0 bg-white/95 backdrop-blur-sm border-gray-200/50">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <DropdownMenuLabel className="text-base font-semibold">
            Notifications
            {loading && <span className="ml-2 text-xs text-gray-500">Loading...</span>}
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
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications</div>
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
                        <p className="text-sm font-medium text-gray-900 break-words whitespace-pre-line max-w-[180px]">
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
                    <NotificationMessage message={notification.message} />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                        <Clock className="h-3 w-3" />
                        <span>{notification.timestamp}</span>
                        <span className="mx-1">•</span>
                        {getCategoryIcon(notification.category)}
                        <span className="capitalize">
                          {notification.category}
                        </span>
                        {notification.warehouse && (
                          <>
                            <span className="mx-1">•</span>
                            {getWarehouseIcon(notification.warehouse)}
                            <span className="capitalize">{formatWarehouse(notification.warehouse)}</span>
                          </>
                        )}
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
  )
}