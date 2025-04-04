import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EquipoForm from '@/components/EquipoForm';
import { EquipoFormulario } from '@/types/equipo';
import { equipoService } from '@/services/equipoService';
import Swal from 'sweetalert2';

const AddEquipo: React.FC = () => {
  const navigate = useNavigate();

  const handleGuardar = async (equipo: EquipoFormulario) => {
    try {
      await equipoService.crear(equipo);
      
      Swal.fire({
        icon: 'success',
        title: 'Equipo Creado',
        text: 'El equipo se ha creado correctamente'
      });

      navigate('/equipos');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el equipo'
      });
    }
  };

  const handleCancelar = () => {
    navigate('/equipos');
  };

  return (
    <div className="container">
      <h1>Agregar Nuevo Equipo</h1>
      <EquipoForm 
        onGuardar={handleGuardar}
        onCancelar={handleCancelar}
      />
    </div>
  );
};

export default AddEquipo;