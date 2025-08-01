Here’s your **final, polished `README.md`** for your project **ProHire – Freelancer Marketplace**, including all the latest updates (notifications, seeding, tech stack, deployment prep, etc.).

---

```markdown
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

```

/client             --> React frontend
/server             --> Express backend
/models             --> Mongoose schemas
/routes             --> API routes (auth, projects, notifications)
/components         --> UI Components (Cards, Modals, etc.)
/pages              --> Page views (Dashboard, Login, Notifications)
/seed               --> DB seeding scripts (freelancers, projects, apps)

````

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/MokshaOdlamaani2/Prohire-freelancer-marketplace.git
cd Prohire-freelancer-marketplace
````

### 2. Environment Variables

#### ➤ Backend (`server/.env`)

```env
MONGO_URI=mongodb://localhost:27017/prohire
JWT_SECRET=yourSecretKey
PORT=5000
```

#### ➤ Frontend (`client/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies

#### Backend

```bash
cd server
npm install
npm run dev
```

#### Frontend

```bash
cd ../client
npm install
npm start
```

---

## 🔔 Notification System Flow

* When an event (e.g., freelancer applies) occurs, backend emits a `new_notification` via Socket.IO
* Client joins a private room based on their user ID
* Frontend listens for `new_notification` and updates UI in real-time
* Badge shows unread status
* REST API allows:

  * Marking individual or all notifications as read
  * Clearing all notifications

### 🔧 Key Files

| File                            | Description                           |
| ------------------------------- | ------------------------------------- |
| `server.js`                     | Socket.IO setup and user room joining |
| `NotificationsPage.jsx`         | Displays and manages notifications    |
| `routes/notificationsRoutes.js` | API routes (GET, PATCH, DELETE)       |
| `models/Notification.js`        | Mongoose schema for notifications     |
| `client/socket.js`              | Shared socket client instance         |

---

## 🧪 Seeding the Database

To populate with test users and data:

```bash
node seed/insertFreelancers.js
node seed/addProjects.js
node seed/addApplications.js
```

---

## 🌐 Deployment Notes

* Frontend: Deploy to **Vercel** or **Netlify**
* Backend: Deploy to **Render**, **Railway**, or **Heroku**
* Use **MongoDB Atlas** for production DB
* Enable CORS and use `.env.production` configs

---

## 🙌 Author

Built with ❤️ by [Moksha Odlamaani](https://github.com/MokshaOdlamaani2)

---

## 🏁 Coming Soon

* Screenshots of dashboards and flows
* Optional project delivery & review feature
* Admin UI

```

---

Would you like a **README badge** section? (e.g., `![MERN](https://img.shields.io/badge/MERN-FullStack-green)`)  
Or a **project logo / banner** to include at the top?

Let me know — I’ll generate them for you!
```

