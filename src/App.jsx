import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import AddEquipo from "./pages/AddEquipo";
import ListaEquipos from "./pages/ListaEquipos";
import ParticlesBackground from "./components/ParticlesBackground";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <ParticlesBackground />
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
        </Routes>
      </div>
    </>
  );
}

export default App;


