import React from "react";

export default function EquipoForm({ nuevoEquipo, handleChange, agregarOActualizarEquipo, setMostrarFormulario, editando }) {
  return (
    <div className="position-fixed top-50 start-50 translate-middle bg-white text-dark p-4 rounded shadow-lg w-100 w-md-50">
      <h1 className="text-center mb-3 text-primary">{editando ? "Editar Equipo" : "Agregar Equipo"}</h1>
      <p className="text-center text-muted">Complete todos los campos antes de continuar</p>
      <div className="row mb-3 justify-content-center">
        {Object.entries(nuevoEquipo).map(([campo, valor], index) => (
          <div key={index} className="col-12 col-md-6">
            <label className="form-label fw-bold text-uppercase text-secondary">
              {campo.replace(/([A-Z])/g, " $1").trim()}
            </label>
            <input
              className="form-control mb-3 text-center border-primary rounded"
              name={campo}
              type={campo === "vencimientoPagos" ? "date" : "text"}
              value={valor ?? ""}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>
      <button className="btn btn-primary mb-2 w-100 btn-lg" onClick={agregarOActualizarEquipo}>
        {editando ? "Actualizar Equipo" : "Agregar Equipo"}
      </button>
      <button className="btn btn-secondary w-100 btn-lg" onClick={() => setMostrarFormulario(false)}>
        Cancelar
      </button>
    </div>
  );
}
