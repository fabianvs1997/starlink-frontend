import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { statsService } from '@/services/statsService';
import { StatsData } from '@/types/stats';
import Swal from 'sweetalert2';

const COLORS = ['#00ff99', '#ff0066', '#00a2ff'];

const Stats: React.FC = () => {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const data = await statsService.obtenerEstadisticas();
        setStatsData(data);
        setLoading(false);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las estadísticas'
        });
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  if (loading) {
    return <div>Cargando estadísticas...</div>;
  }

  if (!statsData) {
    return <div>No hay datos disponibles</div>;
  }

  // Datos para gráfico de estado de equipos
  const estadoEquiposData = [
    { name: 'Activos', value: statsData.general.equiposActivos },
    { name: 'Inactivos', value: statsData.general.equiposInactivos }
  ];

  return (
    <div className="stats-container">
      <h1>Estadísticas de Starlink</h1>

      {/* Sección de Estadísticas Generales */}
      <section className="stats-section">
        <h2>Resumen General</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total de Equipos</h3>
            <p>{statsData.general.totalEquipos}</p>
          </div>
          <div className="stat-card">
            <h3>Equipos Activos</h3>
            <p>{statsData.general.equiposActivos}</p>
          </div>
          <div className="stat-card">
            <h3>Equipos Inactivos</h3>
            <p>{statsData.general.equiposInactivos}</p>
          </div>
        </div>
      </section>

      {/* Sección de Estadísticas de Pagos */}
      <section className="stats-section">
        <h2>Estadísticas de Pagos</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total de Pagos</h3>
            <p>${statsData.pagos.totalPagos.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Promedio de Pagos</h3>
            <p>${statsData.pagos.promedioPagos.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Equipos con Pagos Pendientes</h3>
            <p>{statsData.pagos.equiposConPagosPendientes}</p>
          </div>
        </div>
      </section>

      {/* Gráficos */}
      <section className="stats-section">
        <h2>Visualización de Datos</h2>
        <div className="charts-container">
          {/* Gráfico de Estado de Equipos */}
          <div className="chart-card">
            <h3>Estado de Equipos</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={estadoEquiposData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {estadoEquiposData.map((entry, index) => (
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

          {/* Gráfico de Equipos por Mes */}
          <div className="chart-card">
            <h3>Nuevos Equipos por Mes</h3>
            <BarChart width={500} height={300} data={statsData.porMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="nuevoEquipos" fill="#00ff99" />
            </BarChart>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Stats;