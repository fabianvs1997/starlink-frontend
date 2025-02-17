// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Métricas
  const [totalEquipos, setTotalEquipos] = useState(0);
  const [activos, setActivos] = useState(0);
  const [inactivos, setInactivos] = useState(0);

  useEffect(() => {
    fetch("https://starlink-equipos.onrender.com/api/equipos")
      .then((res) => res.json())
      .then((data) => {
        setEquipos(data);
        setLoading(false);

        // Calcular métricas
        const total = data.length;
        const countActivos = data.filter((eq) => eq.equiposActivos).length;
        const countInactivos = total - countActivos;

        setTotalEquipos(total);
        setActivos(countActivos);
        setInactivos(countInactivos);
      })
      .catch((err) => {
        console.error("Error fetching equipos:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Cargando dashboard...</div>;
  }

  // Data para el gráfico de torta
  const pieData = [
    { name: "Activos", value: activos },
    { name: "Inactivos", value: inactivos },
  ];

  // Colores para cada segmento
  const COLORS = ["#00ff99", "#ff0066"];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Panel de Control</h1>

      {/* Tarjetas de métricas */}
      <div className="metric-cards">
        <div className="metric-card">
          <h3>Total de Equipos</h3>
          <p>{totalEquipos}</p>
        </div>
        <div className="metric-card">
          <h3>Activos</h3>
          <p>{activos}</p>
        </div>
        <div className="metric-card">
          <h3>Inactivos</h3>
          <p>{inactivos}</p>
        </div>
      </div>

      {/* Gráfico de torta: Activos vs Inactivos */}
      <div className="chart-section">
        <h3>Estado de Equipos</h3>
        <PieChart width={400} height={300}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Últimos equipos agregados */}
      <div className="last-equipos">
        <h3>Últimos Equipos Agregados</h3>
        <ul>
          {equipos
            .slice()        // copiamos el array
            .reverse()      // simulamos "más recientes" si no tenemos un campo de fecha
            .slice(0, 5)    // tomamos los primeros 5
            .map((eq) => (
              <li key={eq.id}>
                {eq.nombre} - {eq.correo}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
