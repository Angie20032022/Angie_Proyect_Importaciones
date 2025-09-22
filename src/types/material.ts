export interface Material {
  id: string;
  nombre: string;
  codigo: string;
  categoria: 'Metales' | 'Químicos' | 'Textiles' | 'Electrónicos' | 'Construcción' | 'Otro';
  descripcion: string;
  proveedor: string;
  paisOrigen: string;
  precio: number;
  unidad: 'kg' | 'ton' | 'mt' | 'pcs' | 'lt' | 'm3';
  cantidadMinima: number;
  tiempoEntrega: number; // días
  fechaRegistro: string;
  estado: 'Activo' | 'Descontinuado' | 'En Proceso';
  aranceles: number; // porcentaje
  documentosRequeridos: string[];
}

export interface Importacion {
  id: string;
  numeroOrden: string;
  materialId: string;
  material: Material;
  cantidad: number;
  precioTotal: number;
  fechaPedido: string;
  fechaEstimadaEntrega: string;
  estado: 'Cotizando' | 'Pedido' | 'En Tránsito' | 'En Aduana' | 'Entregado' | 'Cancelado';
  proveedorContacto: string;
  documentosSubidos: string[];
  observaciones: string;
  costoLogistica: number;
  costoAranceles: number;
}