export default function Table({ equipos, editarEquipo, eliminarEquipo }) {
  return (
    <div className="table-responsive text-center">
      <table className="table table-striped table-bordered mt-4">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Contraseña</th>
            <th>Pagos</th>
            <th>Vencimiento de Pagos</th>
            <th>Cuenta de Tarjeta</th>
            <th>Número de Equipos</th>
            <th>Número de ID</th>
            <th>Número de Serie</th>
            <th>Número de Kit</th>
            <th>Equipos Activos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((equipo, index) => (
            <tr key={index}>
              <td>{equipo.nombre}</td>
              <td>{equipo.correo}</td>
              <td>{equipo.contrasena}</td>
              <td>{equipo.pagos}</td>
              <td>{equipo.vencimientoPagos ? new Date(equipo.vencimientoPagos).toLocaleDateString() : "Sin fecha"}</td>
              <td>{equipo.cuentaTarjeta}</td>
              <td>{equipo.numeroEquipos}</td>
              <td>{equipo.numeroId}</td>
              <td>{equipo.numeroSerie}</td>
              <td>{equipo.numeroKit}</td>
              <td>{equipo.equiposActivos ? "Sí" : "No"}</td>
              <td className="d-flex flex-column align-items-center">
                <button className="btn btn-warning btn-sm mb-2" onClick={() => editarEquipo(equipo)}>
                  Editar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => eliminarEquipo(equipo.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
