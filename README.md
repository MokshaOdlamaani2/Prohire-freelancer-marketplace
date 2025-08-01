# 🧑‍💻 ProHire – Freelancer Marketplace (MERN Stack)

**ProHire** is a full-stack freelance hiring platform built with the MERN stack (MongoDB, Express.js, React, Node.js). It allows clients to post projects, freelancers to apply, and both to manage workflows in a real-time, modern interface.

---

## 🚀 Features

### 🔐 Authentication & Roles
- JWT-based auth
- Secure password hashing with Bcrypt
- Roles: `freelancer`, `client`, `admin`

### 🧑‍💼 Client Features
- Post/edit/delete projects with deadline, budget, and required skills
- View project applications and hire freelancers
- Project dashboard with status filtering

### 👤 Freelancer Features
- Apply to projects with portfolio/contact info
- View application status (`pending`, `shortlisted`, `hired`, `rejected`)
- Assigned projects and work delivery
- Manage profile with skills, rate, bio, experience, and portfolio

### 🔔 Real-Time Notification System
- Built with **Socket.IO**
- Users join private rooms and receive instant event notifications
- Red badge for unread alerts
- Mark single or all as read
- Option to clear all notifications
- Timestamps shown like "2 minutes ago" (via `date-fns`)

### 🖥️ Admin Panel (optional)
- Manage all users, projects, and reviews (available for future use)

---

## 📦 Tech Stack

| Layer       | Tech                             |
|-------------|----------------------------------|
| Frontend    | React, Axios, Toastify           |
| Backend     | Node.js, Express.js              |
| Database    | MongoDB + Mongoose               |
| Real-Time   | Socket.IO                        |
| Auth        | JWT, Bcrypt                      |
| Utils       | dotenv, date-fns, Nodemailer     |
| Styling     | Custom CSS + Component CSS       |

---

## 📁 Folder Structure

