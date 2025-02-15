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
      // Antes buscabas solo en eq.nombre o eq.correo

      // Ahora buscamos en TODOS los campos del objeto
      return Object.values(eq).some((val) => {
        if (!val) return false; // si es null/undefined, ignoramos
        return val.toString().toLowerCase().includes(term);
      });
    });
    setFilteredEquipos(filtered);
  }
}, [searchTerm, equipos]);


  // Manejo de formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoEquipo((prev) => ({
      ...prev,
      [name]: name === "vencimientoPagos" ? value.split("T")[0] : value,
    }));
  };

  // Agregar/Actualizar
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
       Swal.fire({
  title: editando ? "Actualizado" : "Agregado",
  text: "El equipo ha sido guardado correctamente",
  icon: "success",
  confirmButtonText: "OK",
  confirmButtonColor: "#00ff99",
  background: "rgba(255, 255, 255, 0.1)",
  color: "#fff",
  backdrop: "rgba(0,0,0,0.8)"
});

        setEditando(null);
        setMostrarFormulario(false);
        setNuevoEquipo(initialEquipo);
      })
      .catch((error) => {
        console.error("Error al guardar el equipo:", error);
        Swal.fire("Error", "No se pudo guardar el equipo", "error");
      });
  };

// Eliminar
const eliminarEquipo = (id) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esta acción",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",

    // *** Ajustes de estilo "futurista" ***
    background: "rgba(255, 255, 255, 0.1)",  // Fondo translúcido
    color: "#fff",                           // Texto blanco
    backdrop: "rgba(0,0,0,0.8)",             // Cortina oscura
    confirmButtonColor: "#00ff99",           // Botón "Sí, eliminar" verde neón
    cancelButtonColor: "#ff0066",            // Botón "Cancelar" rojo neón
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
          Swal.fire({
            title: "Eliminado",
            text: "El equipo ha sido eliminado correctamente",
            icon: "success",
            confirmButtonText: "OK",

            // Ajustes de estilo en la alerta de éxito
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            backdrop: "rgba(0,0,0,0.8)",
            confirmButtonColor: "#00ff99",
          });
        })
        .catch((error) => {
          console.error("Error al eliminar el equipo:", error);
          Swal.fire({
            title: "Error",
            text: "No se pudo eliminar el equipo",
            icon: "error",

            // Ajustes de estilo en la alerta de error
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            backdrop: "rgba(0,0,0,0.8)",
            confirmButtonColor: "#ff0066",
          });
        });
    }
  });
};


  // Editar
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
    <div className="futuristic-container">
       <h1 className="futuristic-title">Starlink Equipos</h1>
      <div className="row w-100 mb-3">
        <div className="col-12 col-md-6 mb-2 mb-md-0">
          <input
            className="form-control futuristic-search"
            type="text"
            placeholder="Buscar equipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-6 d-flex justify-content-md-end">
          <button
            className="btn-futuristic"
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

      <div className="futuristic-card">
        <div className="futuristic-card-body">
          {filteredEquipos.length === 0 ? (
            <div className="alert alert-info w-100 text-center m-0">
              {equipos.length === 0
                ? "No hay equipos registrados. ¡Agrega el primero!"
                : "No se encontraron resultados para tu búsqueda."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <EquipoTable
                equipos={filteredEquipos}
                editarEquipo={editarEquipo}
                eliminarEquipo={eliminarEquipo}
              />
            </div>
          )}
        </div>
      </div>

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




