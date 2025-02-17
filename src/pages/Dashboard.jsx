// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Métricas básicas
  const [totalEquipos, setTotalEquipos] = useState(0);
  const [activos, setActivos] = useState(0);
  const [inactivos, setInactivos] = useState(0);

  // Próximos a vencer
  const [proximosVencer, setProximosVencer] = useState([]);

  // Estadísticas de pagos
  const [sumPagos, setSumPagos] = useState(0);
  const [avgPagos, setAvgPagos] = useState(0);
  const [countOverX, setCountOverX] = useState(0); // pagos >= X

  // Datos para gráfico de registros en el tiempo
  const [monthlyData, setMonthlyData] = useState([]);

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

        // Calcular Próximos a vencer (dentro de 7 días)
        const hoy = new Date();
        const en7Dias = new Date(hoy);
        en7Dias.setDate(en7Dias.getDate() + 7);

        const proximos = data.filter((eq) => {
          if (!eq.vencimientoPagos) return false;
          const [year, month, day] = eq.vencimientoPagos.split("-");
          const vencDate = new Date(year, month - 1, day);
          return vencDate >= hoy && vencDate <= en7Dias;
        });
        setProximosVencer(proximos);

        // Estadísticas de pagos
        let sum = 0;
        let countOver = 0;
        const X = 1000; // Ejemplo: pagos >= 1000
        data.forEach((eq) => {
          const pagos = eq.pagos || 0;
          sum += pagos;
          if (pagos >= X) countOver++;
        });
        const avg = total > 0 ? sum / total : 0;
        setSumPagos(sum);
        setAvgPagos(avg);
        setCountOverX(countOver);

        // Gráfico de registros por mes (asumiendo eq.createdAt con formato YYYY-MM-DD)
        const monthlyMap = {};
        data.forEach((eq) => {
          if (!eq.createdAt) return;
          const [y, m] = eq.createdAt.split("-"); // ignoramos día
          const key = `${y}-${m}`; // "2025-02"
          if (!monthlyMap[key]) monthlyMap[key] = 0;
          monthlyMap[key]++;
        });
        // Convertir a array ordenado
        const sortedKeys = Object.keys(monthlyMap).sort();
        const chartData = sortedKeys.map((key) => ({
          month: key,
          count: monthlyMap[key],
        }));
        setMonthlyData(chartData);
      })
      .catch((err) => {
        console.error("Error fetching equipos:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Cargando dashboard...</div>;
  }

  // Data para el gráfico de torta Activos vs Inactivos
  const pieData = [
    { name: "Activos", value: activos },
    { name: "Inactivos", value: inactivos },
  ];
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

      {/* Próximos a vencer */}
      <div className="metric-cards">
        <div className="metric-card">
          <h3>Próximos a vencer (7 días)</h3>
          <p>{proximosVencer.length}</p>
        </div>
      </div>
      {/* Opcional: mostrar lista rápida */}
      {proximosVencer.length > 0 && (
        <div className="last-equipos">
          <h3>Detalles de próximos a vencer</h3>
          <ul>
            {proximosVencer.map((eq) => (
              <li key={eq.id}>
                {eq.nombre} - vence el {eq.vencimientoPagos}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Estadísticas de pagos */}
      <div className="metric-cards">
        <div className="metric-card">
          <h3>Suma total de Pagos</h3>
          <p>{sumPagos}</p>
        </div>
        <div className="metric-card">
          <h3>Promedio de Pagos</h3>
          <p>{avgPagos.toFixed(2)}</p>
        </div>
        <div className="metric-card">
          <h3>Pagos >= 1000</h3>
          <p>{countOverX}</p>
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
            .slice()
            .reverse()
            .slice(0, 5)
            .map((eq) => (
              <li key={eq.id}>
                {eq.nombre} - {eq.correo}
              </li>
            ))}
        </ul>
      </div>

      {/* Gráfico de registros en el tiempo */}
      <div className="chart-section">
        <h3>Registros por Mes</h3>
        <LineChart width={600} height={300} data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#00ff99"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </div>
    </div>
  );
}

