/* eslint-disable react/prop-types */
// In AuthProvider.jsx
import { createContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  // Initialize auth state from sessionStorage
  const [auth, setAuth] = useState(() => {
    const storedAuth = sessionStorage.getItem('auth');
    return storedAuth ? JSON.parse(storedAuth) : {};
  });

  // Update sessionStorage when auth changes
  useEffect(() => {
    if (Object.keys(auth).length > 0) {
      sessionStorage.setItem('auth', JSON.stringify(auth));
    } else {
      sessionStorage.removeItem('auth');
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;