import React from 'react';
import { TrendingUp, Package, Truck, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardProps {
  materialesCount: number;
  importacionesCount: number;
  importacionesActivas: number;
  costoTotal: number;
  importacionesPendientes: number;
  importacionesCompletadas: number;
}

export function Dashboard({ 
  materialesCount, 
  importacionesCount, 
  importacionesActivas, 
  costoTotal,
  importacionesPendientes,
  importacionesCompletadas
}: DashboardProps) {
  const stats = [
    {
      title: 'Total Materiales',
      value: materialesCount,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12% este mes'
    },
    {
      title: 'Importaciones Total',
      value: importacionesCount,
      icon: Truck,
      color: 'bg-green-500',
      change: '+8% este mes'
    },
    {
      title: 'En Proceso',
      value: importacionesActivas,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      change: 'En tiempo'
    },
    {
      title: 'Valor Total',
      value: `$${costoTotal.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+15% este mes'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard de Importaciones</h1>
            <p className="text-indigo-100">Gestión integral de materiales e importaciones</p>
          </div>
          <TrendingUp className="w-12 h-12 text-indigo-200" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Importaciones</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-600">Pendientes</span>
              </div>
              <span className="font-semibold text-yellow-600">{importacionesPendientes}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Completadas</span>
              </div>
              <span className="font-semibold text-green-600">{importacionesCompletadas}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Mensual</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Nuevas Importaciones</span>
              <span className="font-semibold text-indigo-600">{Math.floor(importacionesCount * 0.3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Materiales Activos</span>
              <span className="font-semibold text-indigo-600">{Math.floor(materialesCount * 0.8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Eficiencia</span>
              <span className="font-semibold text-green-600">94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}