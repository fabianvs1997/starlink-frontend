import React, { useState, useEffect } from 'react';
import { Equipo, EquipoFiltros } from '@/types/equipo';
import { equipoService } from '@/services/equipoService';
import Swal from 'sweetalert2';

const ListaEquipos: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [filtros, setFiltros] = useState<EquipoFiltros>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEquipos = async () => {
      try {
        setLoading(true);
        const datos = await equipoService.obtenerTodos();
        setEquipos(datos);
      } catch (err) {
        setError('No se pudieron cargar los equipos');
        Swal.fire('Error', 'No se pudieron cargar los equipos', 'error');
      } finally {
        setLoading(false);
      }
    };

    cargarEquipos();
  }, []);

  const handleFiltrar = async () => {
    try {
      const equiposFiltrados = await equipoService.obtenerPorFiltros(filtros);
      setEquipos(equiposFiltrados);
    } catch (err) {
      Swal.fire('Error', 'No se pudieron aplicar los filtros', 'error');
    }
  };

  const handleEliminar = async (id: string) => {
    const resultado = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });

    if (resultado.isConfirmed) {
      try {
        await equipoService.eliminar(id);
        setEquipos(equipos.filter(equipo => equipo.id !== id));
        Swal.fire('Eliminado', 'El equipo ha sido eliminado', 'success');
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar el equipo', 'error');
      }
    }
  };

  if (loading) return <div>Cargando equipos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container">
      <h1>Lista de Equipos</h1>

      {/* Filtros */}
      <div className="filtros mb-3">
        <input 
          type="text" 
          placeholder="Nombre" 
          value={filtros.nombre || ''} 
          onChange={(e) => setFiltros({...filtros, nombre: e.target.value})}
        />
        <select 
          value={filtros.activos?.toString() || ''} 
          onChange={(e) => setFiltros({
            ...filtros, 
            activos: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined
          })}
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <button onClick={handleFiltrar}>Filtrar</button>
      </div>

      {/* Tabla de Equipos */}
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Número de Equipos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map(equipo => (
            <tr key={equipo.id}>
              <td>{equipo.nombre}</td>
              <td>{equipo.correo}</td>
              <td>{equipo.numeroEquipos}</td>
              <td>{equipo.equiposActivos ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button 
                  className="btn btn-info btn-sm mr-2"
                  onClick={() => {/* Lógica de edición */}}
                >
                  Editar
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleEliminar(equipo.id!)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaEquipos;