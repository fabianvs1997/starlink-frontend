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
    vencimientoPagos: "2025-12-31",
    cuentaTarjeta: "",
    numeroEquipos: 1,
    numeroId: "",
    numeroSerie: "",
    numeroKit: "",
    equiposActivos: true,
  });

  const fetchEquipos = useCallback(() => {
    fetch("http://localhost:8080/api/equipos")
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
    setNuevoEquipo((prev) => ({ ...prev, [name]: name === "vencimientoPagos" ? value.split("T")[0] : value }));
  };

  const confirmarAccion = (mensaje, accion) => {
    Swal.fire({
      title: "Confirmación",
      text: mensaje,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        accion();
      }
    });
  };

  const eliminarEquipo = (id) => {
    setMostrarFormulario(false);
    confirmarAccion("¿Estás seguro de eliminar este equipo?", () => {
      fetch(`http://localhost:8080/api/equipos/${id}`, { method: "DELETE" })
        .then(() => {
          setEquipos((prev) => prev.filter(equipo => equipo.id !== id));
          setFilteredEquipos((prev) => prev.filter(equipo => equipo.id !== id));
        });
    });
  };

  const agregarOActualizarEquipo = () => {
    confirmarAccion(editando ? "¿Deseas actualizar este equipo?" : "¿Deseas agregar este equipo?", () => {
      const metodo = editando ? "PUT" : "POST";
      const url = editando ? `http://localhost:8080/api/equipos/${editando.id}` : "http://localhost:8080/api/equipos/batch";
      const body = editando ? JSON.stringify(nuevoEquipo) : JSON.stringify([nuevoEquipo]);

      fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: body,
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
          setEditando(null);
          setMostrarFormulario(false);
          setNuevoEquipo({
            nombre: "",
            correo: "",
            contrasena: "",
            pagos: 0,
            vencimientoPagos: "2025-12-31",
            cuentaTarjeta: "",
            numeroEquipos: 1,
            numeroId: "",
            numeroSerie: "",
            numeroKit: "",
            equiposActivos: true,
          });
        });
    });
  };

  const handleSearch = () => {
    setFilteredEquipos(equipos.filter(equipo =>
      Object.values(equipo).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    ));
  };

  const editarEquipo = (equipo) => {
    setEditando(equipo);
    setNuevoEquipo(equipo);
    setMostrarFormulario(true); setEditando(equipo);
    setNuevoEquipo({ ...equipo });;
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light p-5">
      <div className="w-100 d-flex justify-content-end mb-4">
        <button className="btn btn-success shadow-lg" onClick={() => setMostrarFormulario(true)}>Agregar Nuevo Equipo</button>
      </div>
      {mostrarFormulario && (
        <div className="position-fixed top-50 start-50 translate-middle bg-white p-5 rounded shadow-lg w-50">
          <h1 className="text-center mb-4 text-primary">{editando ? "Editar Equipo" : "Agregar Equipo"}</h1>
          <p className="text-center text-muted">Complete todos los campos antes de continuar</p>
          <div className="row mb-4 justify-content-center">
            {Object.entries(nuevoEquipo).map(([campo, valor], index) => (
              <div key={index} className="col-md-4">
                <label className="form-label fw-bold text-uppercase text-secondary">{campo.replace(/([A-Z])/g, " $1").trim()}</label>
                <input
                  className="form-control mb-3 text-center border-primary rounded-pill"
                  name={campo}
                  type={campo === "vencimientoPagos" ? "date" : "text"}
                  value={valor ?? ""}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-primary mb-2 w-100 shadow-sm" onClick={agregarOActualizarEquipo}>
            {editando ? "Actualizar Equipo" : "Agregar Equipo"}
          </button>
          <button className="btn btn-secondary w-100 shadow-sm" onClick={() => setMostrarFormulario(false)}>
            Cancelar
          </button>
        </div>
      )}
      <Table equipos={filteredEquipos} editarEquipo={editarEquipo} eliminarEquipo={eliminarEquipo} />
    </div>
  );
}
