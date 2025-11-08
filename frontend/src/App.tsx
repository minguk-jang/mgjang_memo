/**
 * Main application component.
 */

import React from "react";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="app">
        <header>
          <h1>Telegram Memo Alert System</h1>
        </header>
        <main>
          <p>Application structure ready for Phase 3 implementation.</p>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
