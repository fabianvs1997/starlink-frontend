export interface EquipoFormulario {
  nombre: string;
  correo: string;
  contrasena: string;
  pagos: number;
  vencimientoPagos?: string | null;
  cuentaTarjeta?: string;
  numeroEquipos: number;
  numeroId: string;
  numeroSerie: string;
  numeroKit: string;
  equiposActivos: boolean;
}

export interface EquipoFormProps {
  equipo?: Equipo;
  onGuardar: (equipo: EquipoFormulario) => Promise<void>;
  onCancelar: () => void;
}