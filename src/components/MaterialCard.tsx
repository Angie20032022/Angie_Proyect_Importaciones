import React from 'react';
import { Package, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Material } from '../types/material';

interface MaterialCardProps {
  material: Material;
  onSelect: (material: Material) => void;
}

export function MaterialCard({ material, onSelect }: MaterialCardProps) {
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Descontinuado': return 'bg-red-100 text-red-800';
      case 'En Proceso': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'Metales': return 'bg-blue-100 text-blue-800';
      case 'Químicos': return 'bg-purple-100 text-purple-800';
      case 'Textiles': return 'bg-pink-100 text-pink-800';
      case 'Electrónicos': return 'bg-cyan-100 text-cyan-800';
      case 'Construcción': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
         onClick={() => onSelect(material)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-indigo-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{material.nombre}</h3>
            <p className="text-sm text-gray-500">Código: {material.codigo}</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(material.estado)}`}>
            {material.estado}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(material.categoria)}`}>
            {material.categoria}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-gray-600 text-sm">{material.descripcion}</p>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>{material.proveedor} - {material.paisOrigen}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <DollarSign className="w-4 h-4" />
          <span>${material.precio.toFixed(2)} / {material.unidad}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{material.tiempoEntrega} días de entrega</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Cantidad mínima: {material.cantidadMinima} {material.unidad}</span>
          <span className="text-gray-500">Aranceles: {material.aranceles}%</span>
        </div>
      </div>
    </div>
  );
}