import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Material } from '../types/material';

interface MaterialFormProps {
  onClose: () => void;
  onSubmit: (material: Omit<Material, 'id' | 'fechaRegistro'>) => void;
  initialData?: Material;
}

export function MaterialForm({ onClose, onSubmit, initialData }: MaterialFormProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    codigo: initialData?.codigo || '',
    categoria: initialData?.categoria || 'Otro' as const,
    descripcion: initialData?.descripcion || '',
    proveedor: initialData?.proveedor || '',
    paisOrigen: initialData?.paisOrigen || '',
    precio: initialData?.precio || 0,
    unidad: initialData?.unidad || 'kg' as const,
    cantidadMinima: initialData?.cantidadMinima || 1,
    tiempoEntrega: initialData?.tiempoEntrega || 15,
    estado: initialData?.estado || 'Activo' as const,
    aranceles: initialData?.aranceles || 0,
    documentosRequeridos: initialData?.documentosRequeridos || ['']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      documentosRequeridos: formData.documentosRequeridos.filter(doc => doc.trim() !== '')
    });
  };

  const addDocument = () => {
    setFormData(prev => ({
      ...prev,
      documentosRequeridos: [...prev.documentosRequeridos, '']
    }));
  };

  const updateDocument = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      documentosRequeridos: prev.documentosRequeridos.map((doc, i) => i === index ? value : doc)
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentosRequeridos: prev.documentosRequeridos.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Editar Material' : 'Nuevo Material'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Material *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código *
              </label>
              <input
                type="text"
                required
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Metales">Metales</option>
                <option value="Químicos">Químicos</option>
                <option value="Textiles">Textiles</option>
                <option value="Electrónicos">Electrónicos</option>
                <option value="Construcción">Construcción</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                required
                value={formData.estado}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Activo">Activo</option>
                <option value="Descontinuado">Descontinuado</option>
                <option value="En Proceso">En Proceso</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor *
              </label>
              <input
                type="text"
                required
                value={formData.proveedor}
                onChange={(e) => setFormData(prev => ({ ...prev, proveedor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País de Origen *
              </label>
              <input
                type="text"
                required
                value={formData.paisOrigen}
                onChange={(e) => setFormData(prev => ({ ...prev, paisOrigen: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.precio}
                onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad *
              </label>
              <select
                required
                value={formData.unidad}
                onChange={(e) => setFormData(prev => ({ ...prev, unidad: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="ton">Toneladas (ton)</option>
                <option value="mt">Metros (mt)</option>
                <option value="pcs">Piezas (pcs)</option>
                <option value="lt">Litros (lt)</option>
                <option value="m3">Metros cúbicos (m3)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad Mínima *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.cantidadMinima}
                onChange={(e) => setFormData(prev => ({ ...prev, cantidadMinima: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo de Entrega (días) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.tiempoEntrega}
                onChange={(e) => setFormData(prev => ({ ...prev, tiempoEntrega: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aranceles (%) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={formData.aranceles}
                onChange={(e) => setFormData(prev => ({ ...prev, aranceles: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentos Requeridos
            </label>
            <div className="space-y-2">
              {formData.documentosRequeridos.map((doc, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={doc}
                    onChange={(e) => updateDocument(index, e.target.value)}
                    placeholder="Ej: Certificado de origen, Factura comercial..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formData.documentosRequeridos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDocument}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar documento</span>
              </button>
            </div>
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
              {initialData ? 'Actualizar' : 'Crear'} Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}