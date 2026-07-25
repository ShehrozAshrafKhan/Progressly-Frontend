import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import { formatDistanceToNow } from "date-fns";
import Layout from "../../layouts/Layout";

interface Notification {
  notificationId: string;
  message: string;
  isRead: boolean;
  notificationDate: string;
  userId: string;
  taskId: string | null;
  taskTitle: string | null;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.baseUrl}Notifications/my-notifications`);
      if (response.data.result.succeeded) {
        setNotifications(response.data.data || []);
      } else {
        ShowMessage(2, response.data.result.errors[0] || "Failed to fetch notifications");
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await axios.patch(`${config.baseUrl}Notifications/mark-as-read/${id}`);
      if (response.data.result.succeeded) {
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
        );
        // Trigger a custom event to notify layout/navbar header to update its badge count
        window.dispatchEvent(new Event("notificationsUpdated"));
      } else {
        ShowMessage(2, response.data.result.errors[0]);
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Failed to update notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await axios.patch(`${config.baseUrl}Notifications/mark-all-as-read`);
      if (response.data.result.succeeded) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        ShowMessage(1, "All notifications marked as read");
        window.dispatchEvent(new Event("notificationsUpdated"));
      } else {
        ShowMessage(2, response.data.result.errors[0]);
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Failed to mark notifications as read");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering mark as read
    try {
      const response = await axios.delete(`${config.baseUrl}Notifications/${id}`);
      if (response.data.result.succeeded) {
        setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
        ShowMessage(1, "Notification deleted");
        window.dispatchEvent(new Event("notificationsUpdated"));
      } else {
        ShowMessage(2, response.data.result.errors[0]);
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Failed to delete notification");
    }
  };

  const getFilteredNotifications = () => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    if (filter === "read") return notifications.filter((n) => n.isRead);
    return notifications;
  };

  const getNotificationIcon = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes("assigned")) {
      return <i className="bi bi-clipboard-check text-success fs-5"></i>;
    }
    if (lower.includes("overdue")) {
      return <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>;
    }
    if (lower.includes("deadline")) {
      return <i className="bi bi-alarm-fill text-warning fs-5"></i>;
    }
    return <i className="bi bi-bell-fill text-primary fs-5"></i>;
  };

  const filtered = getFilteredNotifications();

  return (
    <Layout>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Notification Center</h2>
          <p className="text-muted mb-0">Stay updated with tasks, deadlines, and project announcements.</p>
        </div>
        <div className="mt-3 mt-md-0">
          <button
            className="btn btn-outline-primary border-2 px-3 py-2 fw-medium me-2"
            onClick={fetchNotifications}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          <button
            className="btn btn-primary px-3 py-2 fw-medium"
            onClick={handleMarkAllAsRead}
            disabled={loading || !notifications.some((n) => !n.isRead)}
          >
            <i className="bi bi-check-all me-1"></i> Mark All Read
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
        {/* Filters */}
        <div className="card-header bg-white border-bottom py-3 px-4">
          <div className="d-flex gap-2">
            {(["all", "unread", "read"] as const).map((type) => (
              <button
                key={type}
                className={`btn btn-sm px-3 py-1.5 rounded-pill fw-medium capitalize ${
                  filter === type
                    ? "btn-primary text-white shadow-sm"
                    : "btn-light text-secondary border-0"
                }`}
                onClick={() => setFilter(type)}
              >
                {type} {type === "unread" && `(${notifications.filter((n) => !n.isRead).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2 mb-0">Fetching your notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 px-4">
              <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                <i className="bi bi-bell-slash text-muted fs-3"></i>
              </div>
              <h5 className="fw-semibold text-dark">No notifications found</h5>
              <p className="text-muted small max-w-sm mx-auto mb-0">
                {filter === "unread"
                  ? "You are all caught up! No unread notifications."
                  : "Notifications and alerts will show up here."}
              </p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filtered.map((n) => (
                <div
                  key={n.notificationId}
                  onClick={() => !n.isRead && handleMarkAsRead(n.notificationId)}
                  className={`list-group-item list-group-item-action d-flex align-items-start gap-3 py-3 px-4 transition-base border-start border-4 cursor-pointer ${
                    n.isRead ? "border-transparent bg-white" : "border-primary bg-primary-soft"
                  }`}
                  style={{ cursor: n.isRead ? "default" : "pointer" }}
                >
                  <div className="flex-shrink-0 bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                    {getNotificationIcon(n.message)}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <p className={`mb-1 text-dark small ${n.isRead ? "text-secondary" : "fw-medium"}`}>
                      {n.message}
                    </p>
                    <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                      {formatDistanceToNow(new Date(n.notificationDate), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex-shrink-0 d-flex gap-2">
                    {!n.isRead && (
                      <button
                        className="btn btn-icon-sm btn-light-success rounded-circle"
                        title="Mark as Read"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n.notificationId);
                        }}
                      >
                        <i className="bi bi-check"></i>
                      </button>
                    )}
                    <button
                      className="btn btn-icon-sm btn-light-danger rounded-circle"
                      title="Delete"
                      onClick={(e) => handleDelete(n.notificationId, e)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .bg-primary-soft {
          background-color: rgba(79, 70, 229, 0.04);
        }
        .btn-light-success {
          background-color: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: none;
        }
        .btn-light-success:hover {
          background-color: #10b981;
          color: white;
        }
        .btn-light-danger {
          background-color: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: none;
        }
        .btn-light-danger:hover {
          background-color: #ef4444;
          color: white;
        }
        .btn-icon-sm {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-size: 0.85rem;
          transition: all 0.2s ease-in-out;
        }
        .border-transparent {
          border-left-color: transparent !important;
        }
        .capitalize {
          text-transform: capitalize;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </Layout>
  );
};

export default Notifications;
