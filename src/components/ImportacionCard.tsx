import React from 'react';
import { Truck, Calendar, DollarSign, FileText, MapPin } from 'lucide-react';
import { Importacion } from '../types/material';

interface ImportacionCardProps {
  importacion: Importacion;
  onSelect: (importacion: Importacion) => void;
}

export function ImportacionCard({ importacion, onSelect }: ImportacionCardProps) {
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Cotizando': return 'bg-yellow-100 text-yellow-800';
      case 'Pedido': return 'bg-blue-100 text-blue-800';
      case 'En Tránsito': return 'bg-purple-100 text-purple-800';
      case 'En Aduana': return 'bg-orange-100 text-orange-800';
      case 'Entregado': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
         onClick={() => onSelect(importacion)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <Truck className="w-8 h-8 text-indigo-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">#{importacion.numeroOrden}</h3>
            <p className="text-sm text-gray-500">{importacion.material.nombre}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(importacion.estado)}`}>
          {importacion.estado}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{importacion.material.proveedor} - {importacion.material.paisOrigen}</span>
          </div>
          <span className="text-sm text-gray-500">
            {importacion.cantidad} {importacion.material.unidad}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Entrega: {new Date(importacion.fechaEstimadaEntrega).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold">${importacion.precioTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>{importacion.documentosSubidos.length} documentos</span>
          </div>
          <span className="text-sm text-gray-500">
            Pedido: {new Date(importacion.fechaPedido).toLocaleDateString()}
          </span>
        </div>
      </div>

      {importacion.observaciones && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 italic">"{importacion.observaciones}"</p>
        </div>
      )}
    </div>
  );
}