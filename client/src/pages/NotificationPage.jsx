import React, { useEffect, useState } from "react";
import api from "../api";
import socket from "../socket";
import { formatDistanceToNow } from "date-fns";
import "../styles/pagesstyle.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // inline toast
  const limit = 20;

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications?limit=${limit}`);
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    try {
      await api.delete("/notifications/clear-all");
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time notifications via socket
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    socket.emit("join", userId);

    socket.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setToast({
        message: notification.content,
        sender: notification.sender?.name || "System",
      });
      setTimeout(() => setToast(null), 3000);
    });

    return () => socket.off("new_notification");
  }, []);

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="notifications-overlay">
      <main className="notifications-page">
        <h1>
          🔔 Your Notifications{" "}
          {hasUnread && <span className="notification-badge" title="Unread notifications" />}
        </h1>

        <div className="notification-controls">
          <button onClick={markAllAsRead} className="mark-all-btn">Mark All as Read</button>
          <button
            onClick={clearAllNotifications}
            className="clear-all-btn"
            style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}
          >
            Clear All
          </button>
        </div>

        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul className="notification-list">
            {notifications.map((note) => (
              <li
                key={note._id || note.timestamp}
                className={`notification-card ${note.isRead ? "read" : "unread"}`}
              >
                <div className="notification-header">
                  <strong>{note.sender?.name || "System"}</strong>
                  <span className="timestamp">
                    {formatDistanceToNow(new Date(note.createdAt || note.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p>{note.content}</p>
                {!note.isRead && (
                  <button
                    onClick={() => markAsRead(note._id)}
                    className="mark-read-btn"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Real-time toast */}
        {toast && (
          <div className="toast">
            <strong>{toast.sender}: </strong>{toast.message}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
