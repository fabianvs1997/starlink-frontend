// src/components/Navbar.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);

  return (
    <nav className="futuristic-navbar">
      <div className="futuristic-navbar-container">
        <div className="futuristic-nav-brand">
          <Link to="/">STARLINK EQUIPOS</Link>
        </div>
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
          {auth && auth.token ? (
            <li>
              <button className="btn-futuristic" onClick={logout}>
                Cerrar Sesión
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;





