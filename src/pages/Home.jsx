import { useEffect, useState, useCallback } from "react";
import Table from "../components/Table";
import Swal from "sweetalert2";

export default function Home() {
  const [equipos, setEquipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoEquipo, setNuevoEquipo] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    pagos: 0,
    vencimientoPagos: "",
    cuentaTarjeta: "",
    numeroEquipos: 1,
    numeroId: "",
    numeroSerie: "",
    numeroKit: "",
    equiposActivos: true,
  });

  const fetchEquipos = useCallback(() => {
    fetch("https://starlink-equipos.onrender.com/api/equipos")
      .then((res) => res.json())
      .then((data) => {
        setEquipos(data);
        setFilteredEquipos(data);
      });
  }, []);

  useEffect(() => {
    fetchEquipos();
  }, [fetchEquipos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoEquipo((prev) => ({
      ...prev,
      [name]: name === "vencimientoPagos" ? value.split("T")[0] : value
    }));
  };

  const agregarOActualizarEquipo = () => {
    const equipoFinal = {
      ...nuevoEquipo,
      vencimientoPagos: nuevoEquipo.vencimientoPagos
        ? new Date(nuevoEquipo.vencimientoPagos).toISOString()
        : null,
    };

    const metodo = editando ? "PUT" : "POST";
    const url = editando
      ? `https://starlink-equipos.onrender.com/api/equipos/${editando.id}`
      : "https://starlink-equipos.onrender.com/api/equipos/batch";

    fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editando ? equipoFinal : [equipoFinal]),
    })
      .then((res) => res.json())
      .then((data) => {
        if (editando) {
          setEquipos((prev) => prev.map((eq) => (eq.id === data.id ? data : eq)));
          setFilteredEquipos((prev) => prev.map((eq) => (eq.id === data.id ? data : eq)));
        } else {
          setEquipos((prev) => [...prev, ...data]);
          setFilteredEquipos((prev) => [...prev, ...data]);
        }
        Swal.fire(editando ? "Actualizado" : "Agregado", "El equipo ha sido guardado correctamente", "success");
        setEditando(null);
        setMostrarFormulario(false);
      });
  };

  const eliminarEquipo = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://starlink-equipos.onrender.com/api/equipos/${id}`, { method: 'DELETE' })
          .then(() => {
            setEquipos((prev) => prev.filter(equipo => equipo.id !== id));
            setFilteredEquipos((prev) => prev.filter(equipo => equipo.id !== id));
            Swal.fire('Eliminado', 'El equipo ha sido eliminado correctamente', 'success');
          });
      }
    });
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredEquipos(equipos.filter(equipo =>
      Object.values(equipo).some(value =>
        value && value.toString().toLowerCase().includes(term)
      )
    ));
  };

  const editarEquipo = (equipo) => {
    setEditando(equipo);
    setNuevoEquipo({
      ...equipo,
      vencimientoPagos: equipo.vencimientoPagos
        ? new Date(equipo.vencimientoPagos).toISOString().split("T")[0]
        : ""
    });
    setMostrarFormulario(true);
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center bg-dark text-light p-3 p-md-5">
      <div className="w-100 d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <input
          className="form-control w-100 w-md-50 mb-2 mb-md-0"
          type="text"
          placeholder="Buscar equipo..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="btn btn-success shadow-lg w-100 w-md-auto" onClick={() => {
          setMostrarFormulario(true);
          setEditando(null);
        }}>
          Agregar Nuevo Equipo
        </button>
      </div>

      <div className="table-responsive w-100">
        <Table equipos={filteredEquipos} editarEquipo={editarEquipo} eliminarEquipo={eliminarEquipo} />
      </div>

      {mostrarFormulario && (
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
      )}
    </div>
  );
}

