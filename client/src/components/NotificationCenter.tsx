import { useState, useEffect } from "react";
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch pending notifications on mount
  const { data: pendingNotifications } =
    trpc.realtime.getPendingNotifications.useQuery(undefined, {
      refetchInterval: 5000, // Poll every 5 seconds
    });

  // Poll for new notifications every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Notifications will be fetched via the query hook
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Load initial pending notifications
  useEffect(() => {
    if (pendingNotifications) {
      setNotifications(prev => {
        const combined = [...pendingNotifications, ...prev];
        return combined.slice(0, 50);
      });
    }
  }, [pendingNotifications]);

  const unreadCount = notifications.length;

  const clearNotification = (idx: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== idx));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "risk_detected":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "approval_requested":
      case "approval_decision":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "comment_added":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case "milestone_achieved":
        return <Zap className="w-4 h-4 text-yellow-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 border-red-300";
      case "high":
        return "bg-orange-100 border-orange-300";
      case "medium":
        return "bg-yellow-100 border-yellow-300";
      default:
        return "bg-blue-100 border-blue-300";
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="font-bold text-lg">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notif, idx) => (
                <div
                  key={idx}
                  className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition group ${getSeverityColor(notif.severity)}`}
                >
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => clearNotification(idx)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{notif.title}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        {notif.message}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {notif.type.replace(/_/g, " ")}
                        </Badge>
                        {notif.severity && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              notif.severity === "critical"
                                ? "bg-red-100 text-red-800"
                                : notif.severity === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : notif.severity === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {notif.severity}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notif.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
