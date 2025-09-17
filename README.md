# 🧑‍💻 ProHire – Freelancer Marketplace (MERN Stack)

**ProHire** is a full-stack freelance hiring platform built with the MERN stack. It enables clients to post jobs and hire, freelancers to apply and manage bids, and both users to interact in real-time through notifications and messaging.

---

## 📽️ Demo

▶️ [Watch Live Demo on YouTube](https://youtu.be/qKVfBD8BHJQ)

---

## 🚀 Features

### 🔐 Authentication & Roles
- JWT-based authentication
- Secure password hashing (bcrypt)
- Role-based access: `freelancer`, `client`, `admin`

### 👤 Freelancer Portal
- Apply to projects with portfolio, rate, and experience
- Track application status: pending, shortlisted, hired, rejected
- Deliver assigned work and manage project dashboard
- Build profile with skills, bio, and contact info

### 🧑‍💼 Client Portal
- Post/edit/delete projects with deadline, budget, and skills
- Shortlist, reject, or hire applicants
- Track project status and manage freelancers

### 🔔 Real-Time Notifications & Chat
- Powered by **Socket.IO**
- Notifications for events (e.g., application received, hire updates)
- Join private rooms using user IDs
- Mark as read / clear notifications
- Live chat (optional module)

---

## 📦 Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React, Axios, Toastify            |
| Backend     | Node.js, Express.js               |
| Database    | MongoDB + Mongoose                |
| Real-Time   | Socket.IO                         |
| Auth        | JWT, Bcrypt                       |
| Utilities   | dotenv, date-fns, Nodemailer      |
| Styling     | Custom CSS, Component CSS         |

---

## 📁 Folder Structure

```text
/client             --> React frontend  
/server             --> Express backend  
/models             --> Mongoose schemas  
/routes             --> API routes (auth, projects, notifications)  
/components         --> UI Components (Cards, Modals, etc.)  
/pages              --> React page views  
/seed               --> DB seeding scripts (freelancers, projects, apps)  

