import React, { createContext, useContext, useState } from 'react';

interface AdminAuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_jwt_token'));

  const login = (newToken: string) => {
    localStorage.setItem('admin_jwt_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('admin_jwt_token');
    setToken(null);
  };

  return (
    <AdminAuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
};