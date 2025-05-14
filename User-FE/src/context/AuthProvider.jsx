/* eslint-disable react/prop-types */
// In AuthProvider.jsx
import { createContext, useState, useEffect, useRef } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  // Initialize auth state from sessionStorage
  const [auth, setAuth] = useState(() => {
    try {
      const storedAuth = sessionStorage.getItem("auth");
      return storedAuth ? JSON.parse(storedAuth) : {};
    } catch (error) {
      console.error("Error parsing auth from sessionStorage:", error);
      sessionStorage.removeItem("auth");
      return {};
    }
  });

  // Theo dõi thay đổi thực sự của auth bằng ref
  const authRef = useRef(auth);

  // Update sessionStorage when auth changes
  useEffect(() => {
    // So sánh chuỗi JSON thay vì object reference
    const currentAuthStr = JSON.stringify(auth);
    const prevAuthStr = JSON.stringify(authRef.current);

    // Chỉ cập nhật khi có thay đổi thực sự
    if (currentAuthStr !== prevAuthStr) {
      authRef.current = auth;

      if (Object.keys(auth).length > 0) {
        sessionStorage.setItem("auth", currentAuthStr);
      } else {
        sessionStorage.removeItem("auth");
      }
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
