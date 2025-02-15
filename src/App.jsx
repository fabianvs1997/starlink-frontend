import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import AddEquipo from "./pages/AddEquipo";
import ListaEquipos from "./pages/ListaEquipos";
import ParticlesBackground from "./components/ParticlesBackground";

function App() {
  return (
    <Router>
      <ParticlesBackground />
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/add-equipo" element={<AddEquipo />} />
          <Route path="/equipos" element={<ListaEquipos />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

