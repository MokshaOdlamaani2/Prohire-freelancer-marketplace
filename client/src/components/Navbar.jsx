import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Bell } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/componentsStyle.css";

const socket = io("http://localhost:5000");

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownTimeout = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      socket.emit("join", userId);
    }

    setLoading(false);
  }, []);

  // Fetch unread notifications count on mount
  useEffect(() => {
    let isMounted = true;

    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const notifications = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        const count = notifications.filter((n) => !n.isRead && !n.read).length;
        if (isMounted) setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    if (user) fetchUnread();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Listen for incoming notifications
  useEffect(() => {
    socket.on("new_notification", () => {
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("notification_read", () => {
      setUnreadCount(0); // all notifications marked as read
    });

    return () => {
      socket.off("new_notification");
      socket.off("notification_read");
    };
  }, []);

  // Cleanup dropdown timeout
  useEffect(() => {
    return () => clearTimeout(dropdownTimeout.current);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    navigate("/login");
  };

  if (loading || !user) return null;

  const { name, role } = user;

  return (
    <>
      <nav className="upwork-navbar">
        <Link to="/" className="logo">
          ProHire
        </Link>

        <div className="nav-section-right">
          <div className="nav-links">
            {role === "client" && (
              <>
                <Link to="/client-dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link to="/post-project" className="nav-link">
                  Post Project
                </Link>
                <Link to="/client/applicants" className="nav-link">
                  View Applicants
                </Link>
              </>
            )}

            {role === "freelancer" && (
              <Link to="/projects" className="nav-link">
                Browse Projects
              </Link>
            )}
          </div>

          <Link
            to="/notifications"
            className="nav-link bell-icon"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notif-dot" />}
          </Link>

          <div
            className="user-dropdown"
            onMouseEnter={() => {
              clearTimeout(dropdownTimeout.current);
              setDropdownOpen(true);
            }}
            onMouseLeave={() => {
              dropdownTimeout.current = setTimeout(() => {
                setDropdownOpen(false);
              }, 200);
            }}
            tabIndex={0}
          >
            <div className="user-toggle">
              <User size={22} />
              <span className="user-name">Hi, {name?.split(" ")[0]}</span>
            </div>

            {dropdownOpen && (
              <div
                className="dropdown-menu"
                onMouseEnter={() => clearTimeout(dropdownTimeout.current)}
                onMouseLeave={() => {
                  dropdownTimeout.current = setTimeout(() => {
                    setDropdownOpen(false);
                  }, 200);
                }}
              >
                <button
                  onClick={handleLogout}
                  className="dropdown-item logout-btn"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {role === "freelancer" && location.pathname === "/freelancer-dashboard" && (
        <div className="freelancer-welcome">
          <h2>Welcome back, {name?.split(" ")[0]}!</h2>
          <p>
            Ready to take on your next project? Browse opportunities or check
            your dashboard for updates.
          </p>
        </div>
      )}
    </>
  );
};

export default Navbar;
