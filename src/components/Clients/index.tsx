import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import ClientList from './ClientList';
import ClientForm from './ClientForm';
import PurchaseHistory from './PurchaseHistory';
import { Client } from '../../types/client';
import { storage } from '../../utils/storage';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();

  // Load initial data
  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      try {
        const data = await storage.clients.load();
        setClients(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error loading clients:', err);
        setError('Error loading clients');
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadClients();
  }, []);

  // Save clients when they change
  const saveClients = useCallback(async (newClients: Client[]) => {
    try {
      await storage.clients.save(newClients);
      setClients(newClients);
    } catch (err) {
      console.error('Error saving clients:', err);
      setError('Error saving clients');
    }
  }, []);

  const handleAddClient = (clientData: Omit<Client, 'id' | 'purchases'>) => {
    const newClient = {
      ...clientData,
      id: Date.now().toString(),
      purchases: []
    };
    saveClients([...clients, newClient]);
    setShowClientForm(false);
  };

  const handleEditClient = (clientData: Omit<Client, 'id' | 'purchases'>) => {
    if (editingClient) {
      setClients(clients.map(c => 
        c.id === editingClient.id ? { ...c, ...clientData } : c
      ));
      saveClients(clients.map(c => c.id === editingClient.id ? { ...c, ...clientData } : c));
      setShowClientForm(false);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      saveClients(clients.filter(c => c.id !== clientId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button
          onClick={() => {
            setEditingClient(undefined);
            setShowClientForm(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {clients.length > 0 ? (
        <ClientList
          clients={clients}
          onEdit={(client) => {
            setEditingClient(client);
            setShowClientForm(true);
          }}
          onDelete={handleDeleteClient}
          onViewHistory={(client) => setSelectedClient(client)}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No hay clientes registrados. Comienza agregando uno nuevo.
        </div>
      )}

      {showClientForm && (
        <ClientForm
          client={editingClient}
          onSubmit={editingClient ? handleEditClient : handleAddClient}
          onClose={() => {
            setShowClientForm(false);
            setEditingClient(undefined);
          }}
          existingCodes={clients.map(c => c.code)}
        />
      )}

      {selectedClient && (
        <PurchaseHistory
          client={selectedClient}
          onClose={() => setSelectedClient(undefined)}
        />
      )}
    </div>
  );
}