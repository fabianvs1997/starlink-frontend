
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="futuristic-navbar">
      {/* Contenedor interno que centra y controla el ancho */}
      <div className="futuristic-navbar-container">
        <div className="futuristic-nav-brand">STARLINK EQUIPOS</div>
        <ul className="futuristic-nav-links">
          <li>
            <Link to="/">Panel de Control</Link>
          </li>
          <li>
            <Link to="/estadisticas">Estadísticas</Link>
          </li>
          <li>
            <Link to="/agregar">Agregar Equipo</Link>
          </li>
          <li>
            <Link to="/lista">Lista de Equipos</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}



