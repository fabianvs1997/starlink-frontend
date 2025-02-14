import { useEffect, useState, useCallback } from "react";
import EquipoForm from "../components/EquipoForm";
import EquipoTable from "../components/EquipoTable";
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
    <div className="container-fluid min-vh-100 d-flex flex-column align-items-center bg-light p-3">
      <div className="w-100 d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <input
          className="form-control w-100 w-md-50 mb-2 mb-md-0"
          type="text"
          placeholder="Buscar equipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-success shadow-lg w-100 w-md-auto" onClick={() => {
          setMostrarFormulario(true);
          setEditando(null);
        }}>
          Agregar Nuevo Equipo
        </button>
      </div>

      <EquipoTable equipos={filteredEquipos} editarEquipo={editarEquipo} eliminarEquipo={eliminarEquipo} />

      {mostrarFormulario && (
        <EquipoForm
          nuevoEquipo={nuevoEquipo}
          handleChange={handleChange}
          agregarOActualizarEquipo={agregarOActualizarEquipo}
          setMostrarFormulario={setMostrarFormulario}
          editando={editando}
        />
      )}
    </div>
  );
}
