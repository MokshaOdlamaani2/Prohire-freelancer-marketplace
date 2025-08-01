import React, { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket"; // 👈 import socket instance
import { formatDistanceToNow } from "date-fns";
import "../styles/pagesstyle.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/notifications?limit=${limit}&skip=${skip}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch("/api/notifications/mark-all-read", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  // NEW: Clear all notifications
  const clearAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete("/api/notifications/clear-all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [skip]);

  // Real-time notifications listener
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    socket.emit("join", userId); // Join room

    socket.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="notifications-overlay">
      <main className="notifications-page">
        <h1>
          🔔 Your Notifications{" "}
          {hasUnread && (
            <span
              className="notification-badge"
              aria-label="You have unread notifications"
              title="You have unread notifications"
            />
          )}
        </h1>

        <div className="notification-controls">
          <button onClick={markAllAsRead} className="mark-all-btn">
            Mark All as Read
          </button>

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
      </main>
    </div>
  );
};

export default NotificationsPage;
