import React from "react";

export default function EquipoForm({
  nuevoEquipo,
  handleChange,
  agregarOActualizarEquipo,
  setMostrarFormulario,
  editando,
}) {
  return (
    <div
      className="modal fade show futuristic-modal"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          {/* Encabezado */}
          <div className="modal-header">
            <h5 className="modal-title">
              {editando ? "Editar Equipo" : "Agregar Equipo"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setMostrarFormulario(false)}
            ></button>
          </div>

          {/* Cuerpo */}
          <div className="modal-body">
            <div className="row">
              {/* Nombre */}
              <div className="col-md-6 mb-3">
                <label>Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={nuevoEquipo.nombre}
                  onChange={handleChange}
                />
              </div>

              {/* Correo */}
              <div className="col-md-6 mb-3">
                <label>Correo</label>
                <input
                  type="email"
                  className="form-control"
                  name="correo"
                  value={nuevoEquipo.correo}
                  onChange={handleChange}
                />
              </div>

              {/* Contraseña */}
              <div className="col-md-6 mb-3">
                <label>Contraseña</label>
                <input
                  type="text"
                  className="form-control"
                  name="contrasena"
                  value={nuevoEquipo.contrasena}
                  onChange={handleChange}
                />
              </div>

              {/* Pagos */}
              <div className="col-md-6 mb-3">
                <label>Pagos</label>
                <input
                  type="number"
                  className="form-control"
                  name="pagos"
                  value={nuevoEquipo.pagos}
                  onChange={handleChange}
                />
              </div>

              {/* Vencimiento Pagos */}
              <div className="col-md-6 mb-3">
                <label>Vencimiento Pagos</label>
                <input
                  type="date"
                  className="form-control"
                  name="vencimientoPagos"
                  value={nuevoEquipo.vencimientoPagos}
                  onChange={handleChange}
                />
              </div>

              {/* Cuenta Tarjeta */}
              <div className="col-md-6 mb-3">
                <label>Cuenta Tarjeta</label>
                <input
                  type="text"
                  className="form-control"
                  name="cuentaTarjeta"
                  value={nuevoEquipo.cuentaTarjeta}
                  onChange={handleChange}
                />
              </div>

              {/* Número de Equipos */}
              <div className="col-md-6 mb-3">
                <label>Número de Equipos</label>
                <input
                  type="number"
                  className="form-control"
                  name="numeroEquipos"
                  value={nuevoEquipo.numeroEquipos}
                  onChange={handleChange}
                />
              </div>

              {/* Número de ID */}
              <div className="col-md-6 mb-3">
                <label>Número de ID</label>
                <input
                  type="text"
                  className="form-control"
                  name="numeroId"
                  value={nuevoEquipo.numeroId}
                  onChange={handleChange}
                />
              </div>

              {/* Número de Serie */}
              <div className="col-md-6 mb-3">
                <label>Número de Serie</label>
                <input
                  type="text"
                  className="form-control"
                  name="numeroSerie"
                  value={nuevoEquipo.numeroSerie}
                  onChange={handleChange}
                />
              </div>

              {/* Número de Kit */}
              <div className="col-md-6 mb-3">
                <label>Número de Kit</label>
                <input
                  type="text"
                  className="form-control"
                  name="numeroKit"
                  value={nuevoEquipo.numeroKit}
                  onChange={handleChange}
                />
              </div>

              {/* Equipos Activos (select para true/false) */}
              <div className="col-md-6 mb-3">
                <label>¿Equipos Activos?</label>
                <select
                  className="form-control"
                  name="equiposActivos"
                  value={nuevoEquipo.equiposActivos ? "true" : "false"}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "equiposActivos",
                        value: e.target.value === "true",
                      },
                    })
                  }
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pie de modal */}
          <div className="modal-footer">
            <button
              className="btn btn-primary"
              onClick={agregarOActualizarEquipo}
            >
              {editando ? "Actualizar Equipo" : "Agregar Equipo"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setMostrarFormulario(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

