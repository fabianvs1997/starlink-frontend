import React from "react";
import Table from "../components/Table";

export default function EquipoTable({ equipos, editarEquipo, eliminarEquipo }) {
  return (
    <div className="table-responsive w-100">
      <Table equipos={equipos} editarEquipo={editarEquipo} eliminarEquipo={eliminarEquipo} />
    </div>
  );
}
