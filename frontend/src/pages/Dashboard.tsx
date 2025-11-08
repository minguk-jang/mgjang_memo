/**
 * Dashboard page - main app component for logged-in users.
 */

import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import MemoForm from "../components/MemoForm";
import MemoList from "../components/MemoList";
import { detectUserTimezone } from "../utils/timezone";

const Dashboard: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authContext?.user || !authContext?.token) {
      navigate("/login");
    }
  }, [authContext, navigate]);

  if (!authContext?.user) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    authContext.logout();
    navigate("/login");
  };

  const handleMemoCreated = () => {
    setSuccessMessage("Memo created successfully with daily alarm!");
    setTimeout(() => setSuccessMessage(""), 5000);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleMemoDeleted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📋 Telegram Memo Alert System</h1>
        <div className="user-info">
          <span>👤 {authContext.user.email}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <div className="dashboard-grid">
          <aside className="sidebar">
            <MemoForm
              onSuccess={handleMemoCreated}
              onError={(error) => console.error(error)}
            />
          </aside>

          <section className="main-content">
            <MemoList
              refreshTrigger={refreshTrigger}
              userTimezone={authContext.user.timezone || detectUserTimezone()}
              onDelete={handleMemoDeleted}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
