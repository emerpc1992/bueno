import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { User } from './types/auth';
import { loadLoginConfig } from './utils/loginConfig';
import { clearAllRecords } from './utils/storage';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    clearAllRecords();
  }, []);

  // Set initial document title
  useEffect(() => {
    const config = loadLoginConfig();
    document.title = config.tabTitle;
    const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (favicon) {
      favicon.href = config.faviconUrl;
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    user ? (
      <Dashboard user={user} onLogout={handleLogout} />
    ) : (
      <LoginForm onLogin={handleLogin} />
    )
  );
}

export default App;
