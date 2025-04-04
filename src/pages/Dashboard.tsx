import React, { useState, useEffect } from 'react';
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
  CartesianGrid 
} from 'recharts';
import { dashboardService } from '@/services/dashboardService';
import { DashboardData, GraficoData } from '@/types/dashboard';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Colores para gráficos
  const COLORS = ['#00ff99', '#ff0066'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.obtenerMetricas();
        setDashboardData(data);
      } catch (err) {
        setError('No se pudieron cargar las métricas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!dashboardData) {
    return null;
  }

  // Datos para gráfico de pastel
  const pieData: GraficoData[] = [
    { name: 'Activos', value: dashboardData.equiposActivos },
    { name: 'Inactivos', value: dashboardData.equiposInactivos }
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Panel de Control</h1>

      {/* Tarjetas de métricas */}
      <div className="metric-cards">
        <div className="metric-card">
          <h3>Total de Equipos</h3>
          <p>{dashboardData.totalEquipos}</p>
        </div>
        <div className="metric-card">
          <h3>Equipos Activos</h3>
          <p>{dashboardData.equiposActivos}</p>
        </div>
        <div className="metric-card">
          <h3>Próximos a Vencer</h3>
          <p>{dashboardData.proximosVencer}</p>
        </div>
      </div>

      {/* Gráfico de estado de equipos */}
      <div className="chart-section">
        <h3>Estado de Equipos</h3>
        <PieChart width={400} height={300}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Últimos equipos agregados */}
      <div className="last-equipos">
        <h3>Últimos Equipos</h3>
        <ul>
          {dashboardData.ultimosEquipos.map(equipo => (
            <li key={equipo.id}>
              {equipo.nombre} - {equipo.correo}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;