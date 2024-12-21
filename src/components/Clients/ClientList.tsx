import React from 'react';
import { Edit, History, Trash2 } from 'lucide-react';
import { Client } from '../../types/client';
import { formatCurrency } from '../../utils/format';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onViewHistory: (client: Client) => void;
}

export default function ClientList({ clients, onEdit, onDelete, onViewHistory }: ClientListProps) {
  const getTotalPurchases = (client: Client) => {
    return client.purchases.reduce((total, purchase) => total + purchase.total, 0);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Compras</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(getTotalPurchases(client))}
                <div className="text-xs text-gray-500">
                  {client.purchases.length} compras realizadas
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewHistory(client)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Ver historial"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(client)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(client.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}