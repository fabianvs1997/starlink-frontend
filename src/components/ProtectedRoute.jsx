// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Obtenemos el token desde localStorage (o desde el contexto de autenticación)
  const token = localStorage.getItem('authToken');

  // Si el token existe, renderizamos el Outlet (las rutas protegidas); de lo contrario, redirigimos al login.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
