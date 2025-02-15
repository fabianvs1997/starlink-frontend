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

  const initialEquipo = {
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
  };
  const [nuevoEquipo, setNuevoEquipo] = useState(initialEquipo);

  const fetchEquipos = useCallback(() => {
    fetch("https://starlink-equipos.onrender.com/api/equipos")
      .then((res) => res.json())
      .then((data) => {
        setEquipos(data);
        setFilteredEquipos(data);
      })
      .catch((error) => {
        console.error("Error al obtener los equipos:", error);
        Swal.fire("Error", "No se pudieron obtener los equipos", "error");
      });
  }, []);

  useEffect(() => {
    fetchEquipos();
  }, [fetchEquipos]);

  // Filtrado de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEquipos(equipos);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = equipos.filter((eq) => {
        const nombre = eq.nombre ? eq.nombre.toLowerCase() : "";
        const correo = eq.correo ? eq.correo.toLowerCase() : "";
        return nombre.includes(term) || correo.includes(term);
      });
      setFilteredEquipos(filtered);
    }
  }, [searchTerm, equipos]);

  // Manejador de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoEquipo((prev) => ({
      ...prev,
      [name]: name === "vencimientoPagos" ? value.split("T")[0] : value,
    }));
  };

  // Agregar o actualizar equipo
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
          setEquipos((prev) =>
            prev.map((eq) => (eq.id === data.id ? data : eq))
          );
          setFilteredEquipos((prev) =>
            prev.map((eq) => (eq.id === data.id ? data : eq))
          );
        } else {
          setEquipos((prev) => [...prev, ...data]);
          setFilteredEquipos((prev) => [...prev, ...data]);
        }
        Swal.fire(
          editando ? "Actualizado" : "Agregado",
          "El equipo ha sido guardado correctamente",
          "success"
        );
        setEditando(null);
        setMostrarFormulario(false);
        setNuevoEquipo(initialEquipo); // Limpia el formulario
      })
      .catch((error) => {
        console.error("Error al guardar el equipo:", error);
        Swal.fire("Error", "No se pudo guardar el equipo", "error");
      });
  };

  // Eliminar equipo
  const eliminarEquipo = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://starlink-equipos.onrender.com/api/equipos/${id}`, {
          method: "DELETE",
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error("Error en la eliminación");
            }
            setEquipos((prev) => prev.filter((equipo) => equipo.id !== id));
            setFilteredEquipos((prev) =>
              prev.filter((equipo) => equipo.id !== id)
            );
            Swal.fire(
              "Eliminado",
              "El equipo ha sido eliminado correctamente",
              "success"
            );
          })
          .catch((error) => {
            console.error("Error al eliminar el equipo:", error);
            Swal.fire("Error", "No se pudo eliminar el equipo", "error");
          });
      }
    });
  };

  // Editar equipo
  const editarEquipo = (equipo) => {
    setEditando(equipo);
    setNuevoEquipo({
      ...equipo,
      vencimientoPagos: equipo.vencimientoPagos
        ? new Date(equipo.vencimientoPagos).toISOString().split("T")[0]
        : "",
    });
    setMostrarFormulario(true);
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column align-items-center bg-light p-3 w-100">
      <h1 className="text-center mb-4">Starlink Equipos</h1>

      {/* Barra de búsqueda y botón de agregar */}
      <div className="row w-100 mb-3">
        <div className="col-12 col-md-6 mb-2 mb-md-0">
          <input
            className="form-control"
            type="text"
            placeholder="Buscar equipo por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-6 d-flex justify-content-md-end">
          <button
            className="btn btn-success shadow-lg"
            onClick={() => {
              setMostrarFormulario(true);
              setEditando(null);
              setNuevoEquipo(initialEquipo);
            }}
          >
            Agregar Nuevo Equipo
          </button>
        </div>
      </div>

      {/* Card blanca que contiene la tabla */}
      <div className="card w-100" style={{ maxWidth: "1200px" }}>
        <div className="card-body">
          {filteredEquipos.length === 0 ? (
            <div className="alert alert-info w-100 text-center">
              {equipos.length === 0
                ? "No hay equipos registrados. ¡Agrega el primero!"
                : "No se encontraron resultados para tu búsqueda."}
            </div>
          ) : (
            <div className="table-responsive">
              <EquipoTable
                equipos={filteredEquipos}
                editarEquipo={editarEquipo}
                eliminarEquipo={eliminarEquipo}
              />
            </div>
          )}
        </div>
      </div>

      {/* Formulario flotante */}
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


