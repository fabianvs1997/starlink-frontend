// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts"; // Ejemplo con Recharts
// import ... para tu bar chart si quieres

export default function Dashboard() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Métricas
  const [totalEquipos, setTotalEquipos] = useState(0);
  const [activos, setActivos] = useState(0);
  const [inactivos, setInactivos] = useState(0);
  // etc.

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

  // Data para el gráfico de torta
  const pieData = [
    { name: "Activos", value: activos },
    { name: "Inactivos", value: inactivos },
  ];

  if (loading) return <div>Cargando dashboard...</div>;

  return (
    <div className="dashboard-container">
      <h1>Panel de Control</h1>

      {/* Tarjetas de métricas */}
      <div className="metric-cards">
        <div className="card">
          <h3>Total de Equipos</h3>
          <p>{totalEquipos}</p>
        </div>
        <div className="card">
          <h3>Activos</h3>
          <p>{activos}</p>
        </div>
        <div className="card">
          <h3>Inactivos</h3>
          <p>{inactivos}</p>
        </div>
        {/* etc. */}
      </div>

      {/* Gráfico de torta Activos vs. Inactivos */}
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
            fill="#8884d8"
            label
          >
            <Cell fill="#00ff99" />
            <Cell fill="#ff0066" />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Lista de últimos equipos agregados */}
      <div className="last-equipos">
        <h3>Últimos Equipos Agregados</h3>
        {/* Ordenar por alguna fecha si la guardas, ej. eq.createdAt */}
        <ul>
          {equipos
            .slice()
            .reverse() // simular "más recientes" si no tienes un campo date
            .slice(0, 5) // tomar 5
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
