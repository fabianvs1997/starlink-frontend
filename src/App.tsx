import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy imports
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Home = React.lazy(() => import('./pages/Home'));
const Stats = React.lazy(() => import('./pages/Stats'));
const AddEquipo = React.lazy(() => import('./pages/AddEquipo'));
const ListaEquipos = React.lazy(() => import('./pages/ListaEquipos'));

// Componente de carga
const LoadingFallback: React.FC = () => (
  <div>Cargando...</div>
);

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          {/* Ruta pública para login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/add-equipo" element={<AddEquipo />} />
            <Route path="/equipos" element={<ListaEquipos />} />
          </Route>

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Suspense>
  );
};

export default App;