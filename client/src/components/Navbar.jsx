import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Bell, Menu, X } from "lucide-react";
import api from "../api";
import socket from "../socket";
import "../styles/componentsstyle.css";

const Navbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownTimeout = useRef(null);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  // Load user and join socket room
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (userId) socket.emit("join", userId);
    }

    setLoading(false);
  }, []);

  // Fetch unread notifications
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/notifications", {
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

    fetchUnread();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Real-time socket updates
  useEffect(() => {
    const handleNewNotification = () => setUnreadCount((prev) => prev + 1);
    const handleNotificationsRead = () => setUnreadCount(0);

    socket.on("new_notification", handleNewNotification);
    socket.on("notification_read", handleNotificationsRead);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("notification_read", handleNotificationsRead);
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
    <nav className="upwork-navbar">
      <Link to="/" className="logo">
        ProHire
      </Link>

      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`nav-section-right ${mobileMenuOpen ? "open" : ""}`}>
        <div className="nav-links">
          {role === "client" && (
            <>
              <Link to="/client-dashboard" className="nav-link">Dashboard</Link>
              <Link to="/post-project" className="nav-link">Post Project</Link>
              <Link to="/client/applicants" className="nav-link">View Applicants</Link>
            </>
          )}
          {role === "freelancer" && (
            <Link to="/projects" className="nav-link">Browse Projects</Link>
          )}
        </div>

        <Link to="/notifications" className="nav-link bell-icon" aria-label="Notifications">
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
              <button onClick={handleLogout} className="dropdown-item logout-btn">
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
