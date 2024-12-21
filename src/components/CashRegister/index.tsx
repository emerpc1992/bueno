import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Minus } from 'lucide-react';
import { storage } from '../../utils/storage';
import { CashRegister as CashRegisterType, CashMovement } from '../../types/cash';
import { formatCurrency } from '../../utils/format';
import CashMovementModal from './CashMovementModal';
import MovementHistory from './MovementHistory';
import ClearHistoryModal from './ClearHistoryModal';

export default function CashRegister() {
  const [cashRegister, setCashRegister] = useState<CashRegisterType>(() => ({
    id: 'current',
    amount: 0,
    lastModified: new Date().toISOString()
  }));
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubtractModal, setShowSubtractModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [clearHistoryError, setClearHistoryError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [registerData, movementsData] = await Promise.all([
          storage.cashRegister.load().catch(() => null),
          storage.cashMovements.load().catch(() => [])
        ]);
        if (registerData && typeof registerData.amount === 'number') {
          setCashRegister(registerData);
        }
        setMovements(Array.isArray(movementsData) ? movementsData : []);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error loading data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (!isLoading) {
      storage.cashRegister.save({
        ...cashRegister,
        amount: Number(cashRegister.amount) || 0
      });
      if (movements.length > 0) {
        storage.cashMovements.save(movements);
      }
    }
  }, [cashRegister, movements, isLoading]);

  const handleAddMovement = (amount: number, reason: string, type: 'add' | 'subtract') => {
    const newMovement: CashMovement = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type,
      amount,
      reason
    };

    // Update cash register amount
    const newAmount = type === 'add' 
      ? cashRegister.amount + amount 
      : cashRegister.amount - amount;

    setCashRegister({
      ...cashRegister,
      amount: Number(newAmount) || 0,
      lastModified: new Date().toISOString()
    });

    // Add movement to history
    setMovements([newMovement, ...movements]);

    // Close modals
    setShowAddModal(false);
    setShowSubtractModal(false);
  };

  const handleClearHistory = (password: string) => {
    if (password !== 'admin2019') {
      setClearHistoryError('Contraseña incorrecta');
      return;
    }
    setMovements([]);
    setShowClearHistoryModal(false);
    setShowHistory(false);
    setClearHistoryError('');
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
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Wallet className="w-6 h-6 mr-2" />
          Caja Chica
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-2">Monto Actual</p>
          <p className="text-4xl font-bold text-gray-900">{formatCurrency(cashRegister.amount)}</p>
          <p className="text-sm text-gray-500 mt-2">
            Última modificación: {new Date(cashRegister.lastModified).toLocaleString()}
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </button>
          <button
            onClick={() => setShowSubtractModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Minus className="w-4 h-4 mr-2" />
            Retirar
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Ver Historial
          </button>
        </div>
      </div>

      {showAddModal && (
        <CashMovementModal
          type="add"
          onSubmit={(amount, reason) => handleAddMovement(amount, reason, 'add')}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showSubtractModal && (
        <CashMovementModal
          type="subtract"
          maxAmount={cashRegister.amount}
          onSubmit={(amount, reason) => handleAddMovement(amount, reason, 'subtract')}
          onClose={() => setShowSubtractModal(false)}
        />
      )}

      {showHistory && (
        <MovementHistory
          movements={movements}
          onClearHistory={() => setShowClearHistoryModal(true)}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showClearHistoryModal && (
        <ClearHistoryModal
          onConfirm={handleClearHistory}
          onClose={() => {
            setShowClearHistoryModal(false);
            setClearHistoryError('');
          }}
          error={clearHistoryError}
        />
      )}
    </div>
  );
}