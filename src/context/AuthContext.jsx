// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, userId: null, loading: true });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      validateAndRefreshToken(storedToken);
    } else {
      setAuth({ token: null, userId: null, loading: false });
      if (location.pathname !== "/login") {
        navigate("/login");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateAndRefreshToken = async (token) => {
    try {
      const validateResponse = await axios.post(
        "https://auth-w1cf.onrender.com/api/auth/validate",
        { token }
      );
      if (validateResponse.data.message === "Token válido") {
        const userId = validateResponse.data.userId;
        const refreshResponse = await axios.post(
          "https://auth-w1cf.onrender.com/api/tokens/refresh",
          { token }
        );
        const newToken = refreshResponse.data.token;
        localStorage.setItem("authToken", newToken);
        setAuth({ token: newToken, userId, loading: false });
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error validando o refrescando token:", error);
      logout();
    }
  };

  const login = async (correo, password) => {
    try {
      const response = await axios.post("https://auth-w1cf.onrender.com/api/auth/login", {
        correo,
        password,
      });
      const token = response.data.token;
      await validateAndRefreshToken(token);
      navigate("/");
    } catch (error) {
      console.error("Error de login:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setAuth({ token: null, userId: null, loading: false });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

