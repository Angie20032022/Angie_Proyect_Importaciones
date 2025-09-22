import React, { useState } from 'react';
import { Plus, Package, Truck, Home, Search, Filter } from 'lucide-react';
import { Material, Importacion } from './types/material';
import { MaterialCard } from './components/MaterialCard';
import { MaterialForm } from './components/MaterialForm';
import { ImportacionCard } from './components/ImportacionCard';
import { ImportacionForm } from './components/ImportacionForm';
import { Dashboard } from './components/Dashboard';
import { useLocalStorage } from './hooks/useLocalStorage';
import { mockMateriales, mockImportaciones } from './data/mockData';

type ActiveTab = 'dashboard' | 'materiales' | 'importaciones';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [materiales, setMateriales] = useLocalStorage<Material[]>('materiales', mockMateriales);
  const [importaciones, setImportaciones] = useLocalStorage<Importacion[]>('importaciones', mockImportaciones);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showImportacionForm, setShowImportacionForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleCreateMaterial = (materialData: Omit<Material, 'id' | 'fechaRegistro'>) => {
    const newMaterial: Material = {
      ...materialData,
      id: generateId(),
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    setMateriales([...materiales, newMaterial]);
    setShowMaterialForm(false);
  };

  const handleCreateImportacion = (importacionData: Omit<Importacion, 'id' | 'numeroOrden' | 'material'>) => {
    if (!selectedMaterial) return;
    
    const numeroOrden = `IMP-2024-${String(importaciones.length + 1).padStart(3, '0')}`;
    const newImportacion: Importacion = {
      ...importacionData,
      id: generateId(),
      numeroOrden,
      material: selectedMaterial
    };
    setImportaciones([...importaciones, newImportacion]);
    setShowImportacionForm(false);
    setSelectedMaterial(null);
  };

  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterial(material);
    setShowImportacionForm(true);
  };

  const filteredMateriales = materiales.filter(material => {
    const matchesSearch = material.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.proveedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filterCategoria === 'all' || material.categoria === filterCategoria;
    const matchesEstado = filterEstado === 'all' || material.estado === filterEstado;
    return matchesSearch && matchesCategoria && matchesEstado;
  });

  const filteredImportaciones = importaciones.filter(importacion => {
    const matchesSearch = importacion.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         importacion.material.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const dashboardStats = {
    materialesCount: materiales.length,
    importacionesCount: importaciones.length,
    importacionesActivas: importaciones.filter(i => !['Entregado', 'Cancelado'].includes(i.estado)).length,
    costoTotal: importaciones.reduce((sum, i) => sum + i.precioTotal, 0),
    importacionesPendientes: importaciones.filter(i => ['Cotizando', 'Pedido', 'En Tránsito', 'En Aduana'].includes(i.estado)).length,
    importacionesCompletadas: importaciones.filter(i => i.estado === 'Entregado').length
  };

  const categories = ['Metales', 'Químicos', 'Textiles', 'Electrónicos', 'Construcción', 'Otro'];
  const estados = ['Activo', 'Descontinuado', 'En Proceso'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Package className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Importaciones</h1>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('materiales')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'materiales' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Materiales</span>
              </button>
              <button
                onClick={() => setActiveTab('importaciones')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'importaciones' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Importaciones</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard {...dashboardStats} />
        )}

        {activeTab === 'materiales' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Catálogo de Materiales</h2>
                <p className="text-gray-600">Gestiona los materiales disponibles para importación</p>
              </div>
              <button
                onClick={() => setShowMaterialForm(true)}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Material</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar materiales..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todos los estados</option>
                  {estados.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Filter className="w-4 h-4" />
                  <span>{filteredMateriales.length} resultados</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMateriales.map(material => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onSelect={handleMaterialSelect}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'importaciones' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Importaciones</h2>
                <p className="text-gray-600">Seguimiento de órdenes de importación</p>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar importaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImportaciones.map(importacion => (
                <ImportacionCard
                  key={importacion.id}
                  importacion={importacion}
                  onSelect={(imp) => console.log('Ver detalles de importación:', imp)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showMaterialForm && (
        <MaterialForm
          onClose={() => setShowMaterialForm(false)}
          onSubmit={handleCreateMaterial}
        />
      )}

      {showImportacionForm && selectedMaterial && (
        <ImportacionForm
          onClose={() => {
            setShowImportacionForm(false);
            setSelectedMaterial(null);
          }}
          onSubmit={handleCreateImportacion}
          material={selectedMaterial}
        />
      )}
    </div>
  );
}

export default App;