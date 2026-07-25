import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import config from "../../../config";
import { ShowMessage } from "../ShowMessage";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  notificationId: string;
  message: string;
  isRead: boolean;
  notificationDate: string;
  userId: string;
  taskId: string | null;
  taskTitle: string | null;
}

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${config.baseUrl}Notifications/unread-count`);
      if (response.data.result.succeeded) {
        setUnreadCount(response.data.data ?? 0);
      }
    } catch (e) {
      console.error("Failed to fetch unread notifications count", e);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const response = await axios.get(`${config.baseUrl}Notifications/my-notifications`);
      if (response.data.result.succeeded) {
        const all: Notification[] = response.data.data || [];
        // show top 5 only
        setRecentNotifications(all.slice(0, 5));
      }
    } catch (e) {
      console.error("Failed to fetch notifications list", e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const handleUpdate = () => {
      fetchUnreadCount();
      if (isOpen) {
        fetchRecentNotifications();
      }
    };

    window.addEventListener("notificationsUpdated", handleUpdate);
    
    // Poll every 60 seconds as a background/live update
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => {
      window.removeEventListener("notificationsUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchRecentNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        const response = await axios.patch(`${config.baseUrl}Notifications/mark-as-read/${n.notificationId}`);
        if (response.data.result.succeeded) {
          setRecentNotifications((prev) =>
            prev.map((item) =>
              item.notificationId === n.notificationId ? { ...item, isRead: true } : item
            )
          );
          setUnreadCount((c) => Math.max(0, c - 1));
          window.dispatchEvent(new Event("notificationsUpdated"));
        }
      } catch (e) {
        console.error("Failed to mark notification as read", e);
      }
    }

    setIsOpen(false);
    navigate("/notifications");
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await axios.patch(`${config.baseUrl}Notifications/mark-all-as-read`);
      if (response.data.result.succeeded) {
        setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        window.dispatchEvent(new Event("notificationsUpdated"));
        ShowMessage(1, "All notifications marked as read");
      }
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  return (
    <div className="position-relative me-3" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="btn btn-link p-2 text-dark position-relative border-0 bg-transparent nav-bell-btn d-flex align-items-center justify-content-center"
        aria-label="Notifications"
        style={{ borderRadius: "50%", width: "40px", height: "40px" }}
      >
        <i className="bi bi-bell fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-1 start-60 translate-middle badge rounded-pill bg-danger border border-light" style={{ padding: "0.25em 0.5em", fontSize: "0.65rem" }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div
          className="card border-0 shadow-lg position-absolute end-0 mt-2 py-0 overflow-hidden text-start rounded-lg navbar-notifications-dropdown"
          style={{ width: "320px", zIndex: 1050 }}
        >
          {/* Header */}
          <div className="card-header bg-white py-3 px-3 d-flex justify-content-between align-items-center border-bottom">
            <span className="fw-bold text-dark fs-6">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="btn btn-link text-primary text-decoration-none p-0 small fw-medium"
                style={{ fontSize: "0.8rem" }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-auto dropdown-notifications-list" style={{ maxHeight: "280px" }}>
            {recentNotifications.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-bell-slash fs-4 mb-2 d-block"></i>
                <span className="small">No notifications yet</span>
              </div>
            ) : (
              recentNotifications.map((n) => (
                <div
                  key={n.notificationId}
                  onClick={() => handleNotificationClick(n)}
                  className={`px-3 py-2.5 d-flex border-bottom transition-base cursor-pointer hover-bg-light ${
                    n.isRead ? "bg-white" : "bg-primary-soft-nav"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <div className="w-100 min-w-0">
                    <p className={`mb-1 small text-dark text-truncate-2 ${n.isRead ? "text-secondary" : "fw-medium"}`} style={{ fontSize: "0.85rem", lineHeight: "1.3" }}>
                      {n.message}
                    </p>
                    <span className="text-muted small" style={{ fontSize: "0.7rem" }}>
                      {formatDistanceToNow(new Date(n.notificationDate), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="card-footer bg-light text-center py-2 border-top">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-primary text-decoration-none fw-semibold small"
              style={{ fontSize: "0.8rem" }}
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .nav-bell-btn:hover {
          background-color: #f8f9fa !important;
          color: #4f46e5 !important;
        }
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
        .bg-primary-soft-nav {
          background-color: rgba(79, 70, 229, 0.03);
        }
        .bg-primary-soft-nav:hover {
          background-color: rgba(79, 70, 229, 0.06);
        }
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .navbar-notifications-dropdown {
          animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* Custom scrollbar for dropdown list */
        .dropdown-notifications-list::-webkit-scrollbar {
          width: 4px;
        }
        .dropdown-notifications-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .dropdown-notifications-list::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
