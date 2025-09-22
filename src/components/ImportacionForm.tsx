import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Material, Importacion } from '../types/material';

interface ImportacionFormProps {
  onClose: () => void;
  onSubmit: (importacion: Omit<Importacion, 'id' | 'numeroOrden' | 'material'>) => void;
  material: Material;
}

export function ImportacionForm({ onClose, onSubmit, material }: ImportacionFormProps) {
  const [formData, setFormData] = useState({
    materialId: material.id,
    cantidad: material.cantidadMinima,
    fechaPedido: new Date().toISOString().split('T')[0],
    estado: 'Cotizando' as const,
    proveedorContacto: '',
    documentosSubidos: [] as string[],
    observaciones: '',
    costoLogistica: 0,
    costoAranceles: 0
  });

  const calcularFechaEntrega = () => {
    const fecha = new Date(formData.fechaPedido);
    fecha.setDate(fecha.getDate() + material.tiempoEntrega);
    return fecha.toISOString().split('T')[0];
  };

  const calcularPrecioTotal = () => {
    const subtotal = material.precio * formData.cantidad;
    const aranceles = subtotal * (material.aranceles / 100);
    return subtotal + formData.costoLogistica + aranceles;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      precioTotal: calcularPrecioTotal(),
      fechaEstimadaEntrega: calcularFechaEntrega(),
      costoAranceles: (material.precio * formData.cantidad) * (material.aranceles / 100)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nueva Importación</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Material Seleccionado</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Nombre:</span> {material.nombre}</div>
            <div><span className="font-medium">Código:</span> {material.codigo}</div>
            <div><span className="font-medium">Proveedor:</span> {material.proveedor}</div>
            <div><span className="font-medium">País:</span> {material.paisOrigen}</div>
            <div><span className="font-medium">Precio:</span> ${material.precio} / {material.unidad}</div>
            <div><span className="font-medium">Cantidad mínima:</span> {material.cantidadMinima} {material.unidad}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad a Importar *
              </label>
              <input
                type="number"
                min={material.cantidadMinima}
                required
                value={formData.cantidad}
                onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unidad: {material.unidad} | Mínimo: {material.cantidadMinima}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Pedido *
              </label>
              <input
                type="date"
                required
                value={formData.fechaPedido}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaPedido: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Inicial *
              </label>
              <select
                required
                value={formData.estado}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Cotizando">Cotizando</option>
                <option value="Pedido">Pedido Confirmado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contacto del Proveedor
              </label>
              <input
                type="text"
                value={formData.proveedorContacto}
                onChange={(e) => setFormData(prev => ({ ...prev, proveedorContacto: e.target.value }))}
                placeholder="Email o teléfono del proveedor"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo de Logística (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costoLogistica}
                onChange={(e) => setFormData(prev => ({ ...prev, costoLogistica: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Estimada de Entrega
              </label>
              <input
                type="date"
                value={calcularFechaEntrega()}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Calculado automáticamente ({material.tiempoEntrega} días)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={3}
              placeholder="Notas adicionales sobre la importación..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Resumen de Costos</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal Material:</span>
                <span>${(material.precio * formData.cantidad).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo Logística:</span>
                <span>${formData.costoLogistica.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Aranceles ({material.aranceles}%):</span>
                <span>${((material.precio * formData.cantidad) * (material.aranceles / 100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-blue-200 pt-2">
                <span>Total:</span>
                <span>${calcularPrecioTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">Documentos Requeridos:</p>
            <div className="text-xs text-gray-500 space-y-1">
              {material.documentosRequeridos.map((doc, index) => (
                <div key={index}>• {doc}</div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Los documentos se pueden subir después de crear la importación
            </p>
          </div>

          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Crear Importación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}