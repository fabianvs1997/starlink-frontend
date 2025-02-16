import React from "react";

// Función auxiliar para formatear fechas en formato "YYYY-MM-DD" a "DD/MM/YYYY"
function formatDate(dateStr) {
  if (!dateStr) return "Sin Fecha";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr; // En caso de formato inesperado
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export default function EquipoTable({ equipos, editarEquipo, eliminarEquipo }) {
  return (
    <table className="table-futuristic">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Contraseña</th>
          <th>Pagos</th>
          <th>Vencimiento de Pagos</th>
          <th>Cuenta Tarjeta</th>
          <th>Número de Equipos</th>
          <th>Número de ID</th>
          <th>Número de Serie</th>
          <th>Número de Kit</th>
          <th>Equipos Activos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {equipos.map((equipo) => (
          <tr key={equipo.id}>
            <td>{equipo.nombre}</td>
            <td>{equipo.correo}</td>
            <td>{equipo.contrasena}</td>
            <td>{equipo.pagos}</td>
            <td>{formatDate(equipo.vencimientoPagos)}</td>
            <td>{equipo.cuentaTarjeta || "N/A"}</td>
            <td>{equipo.numeroEquipos}</td>
            <td>{equipo.numeroId}</td>
            <td>{equipo.numeroSerie}</td>
            <td>{equipo.numeroKit}</td>
            <td>{equipo.equiposActivos ? "Sí" : "No"}</td>
            <td>
              <button
                className="btn-futuristic btn-sm me-2"
                onClick={() => editarEquipo(equipo)}
              >
                Editar
              </button>
              <button
                className="btn-futuristic-danger btn-sm"
                onClick={() => eliminarEquipo(equipo.id)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
