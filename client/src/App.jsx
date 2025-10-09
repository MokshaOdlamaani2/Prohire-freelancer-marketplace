import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import PostProject from "./pages/PostProject";
import BrowseProjects from "./pages/BrowseProjects";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectApplicants from "./pages/Applicants";
import AllApplicantsPage from "./pages/AllApplicantsPage";
import NotificationsPage from "./pages/NotificationPage";

// Dashboards
import ClientDashboard from "./dashboards/ClientDashboard";
import FreelancerDashboard from "./dashboards/FreelancerDashboard";

// Components
import Navbar from "./components/Navbar";
const ProposalFormPage = React.lazy(() => import("./pages/ProposalFormPage"));

import "./App.css";


// ✅ Role-based route protection
const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

function AppContent() {
  const location = useLocation();

  // Hide Navbar on Register and Login pages only
  const hideNavbarRoutes = ["/", "/login"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Freelancer Routes */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute role="freelancer">
              <BrowseProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposal-form"
          element={
            <ProtectedRoute role="freelancer">
              <Suspense fallback={<div>Loading Proposal Form...</div>}>
                <ProposalFormPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer-dashboard"
          element={
            <ProtectedRoute role="freelancer">
              <FreelancerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Client Routes */}
        <Route
          path="/post-project"
          element={
            <ProtectedRoute role="client">
              <PostProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-dashboard"
          element={
            <ProtectedRoute role="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/applicants"
          element={
            <ProtectedRoute role="client">
              <ProjectApplicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/applicants"
          element={
            <ProtectedRoute role="client">
              <AllApplicantsPage />
            </ProtectedRoute>
          }
        />

        {/* Shared Routes */}
        <Route
          path="/project/:id"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <h2>404 - Page Not Found</h2>
            </div>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <div className="app-wrapper">
          <AppContent />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Suspense>
    </Router>
  );
}

export default App;
