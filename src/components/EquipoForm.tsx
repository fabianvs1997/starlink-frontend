import React, { useState, useEffect } from 'react';
import { Equipo, EquipoFormulario, EquipoFormProps } from '@/types/equipo';
import * as Yup from 'yup';

const esquemaValidacion = Yup.object().shape({
  nombre: Yup.string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  correo: Yup.string()
    .email('Correo inválido')
    .required('El correo es obligatorio'),
  contrasena: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  pagos: Yup.number()
    .positive('Los pagos deben ser un número positivo')
    .required('Los pagos son obligatorios'),
  numeroEquipos: Yup.number()
    .positive('Número de equipos debe ser positivo')
    .required('Número de equipos es obligatorio')
});

const EquipoForm: React.FC<EquipoFormProps> = ({ 
  equipo, 
  onGuardar, 
  onCancelar 
}) => {
  const [formulario, setFormulario] = useState<EquipoFormulario>({
    nombre: '',
    correo: '',
    contrasena: '',
    pagos: 0,
    vencimientoPagos: null,
    cuentaTarjeta: '',
    numeroEquipos: 1,
    numeroId: '',
    numeroSerie: '',
    numeroKit: '',
    equiposActivos: true
  });

  const [errores, setErrores] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (equipo) {
      setFormulario({
        nombre: equipo.nombre,
        correo: equipo.correo,
        contrasena: equipo.contrasena,
        pagos: equipo.pagos,
        vencimientoPagos: equipo.vencimientoPagos || null,
        cuentaTarjeta: equipo.cuentaTarjeta || '',
        numeroEquipos: equipo.numeroEquipos,
        numeroId: equipo.numeroId,
        numeroSerie: equipo.numeroSerie,
        numeroKit: equipo.numeroKit,
        equiposActivos: equipo.equiposActivos
      });
    }
  }, [equipo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormulario(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar formulario
      await esquemaValidacion.validate(formulario, { abortEarly: false });
      
      // Limpiar errores previos
      setErrores({});
      
      // Llamar a función de guardar
      await onGuardar(formulario);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errorMap: {[key: string]: string} = {};
        error.inner.forEach(err => {
          if (err.path) errorMap[err.path] = err.message;
        });
        setErrores(errorMap);
      }
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{equipo ? 'Editar Equipo' : 'Nuevo Equipo'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
            />
            {errores.nombre && <p className="error">{errores.nombre}</p>}
          </div>

          <div className="form-group">
            <label>Correo</label>
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={handleChange}
            />
            {errores.correo && <p className="error">{errores.correo}</p>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={formulario.contrasena}
              onChange={handleChange}
            />
            {errores.contrasena && <p className="error">{errores.contrasena}</p>}
          </div>

          <div className="form-group">
            <label>Pagos</label>
            <input
              type="number"
              name="pagos"
              value={formulario.pagos}
              onChange={handleChange}
            />
            {errores.pagos && <p className="error">{errores.pagos}</p>}
          </div>

          <div className="form-group">
            <label>Vencimiento de Pagos</label>
            <input
              type="date"
              name="vencimientoPagos"
              value={formulario.vencimientoPagos || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Número de Equipos</label>
            <input
              type="number"
              name="numeroEquipos"
              value={formulario.numeroEquipos}
              onChange={handleChange}
            />
            {errores.numeroEquipos && <p className="error">{errores.numeroEquipos}</p>}
          </div>

          <div className="form-group">
            <label>Equipos Activos</label>
            <input
              type="checkbox"
              name="equiposActivos"
              checked={formulario.equiposActivos}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit">
              {equipo ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={onCancelar}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipoForm;