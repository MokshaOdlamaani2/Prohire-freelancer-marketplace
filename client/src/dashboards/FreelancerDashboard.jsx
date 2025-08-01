import React, { useState, useEffect } from "react";
import "../styles/componentsStyle.css";

const FreelancerDashboard = () => {
  const [name, setName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setName(parsedUser.name || "");
    }
  }, []);

  const firstName = name.split(" ")[0] || "";

  return (
    <div className="freelancer-dashboard-container">
      <h2>Welcome back, {firstName}!</h2>
      <p>
        Ready to take on your next project? Browse opportunities or check your dashboard for updates.
      </p>
    </div>
  );
};

export default FreelancerDashboard;
