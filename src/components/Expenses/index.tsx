import React, { useState, useEffect } from 'react';
import { Plus, Tags } from 'lucide-react';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import CancelExpenseModal from './CancelExpenseModal';
import DeleteExpenseModal from './DeleteExpenseModal';
import CategoryManager from './CategoryManager';
import { Expense, ExpenseCategory } from '../../types/expense';
import { storage } from '../../utils/storage';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [cancellingExpense, setCancellingExpense] = useState<Expense | undefined>();
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | undefined>();
  const [deleteError, setDeleteError] = useState('');

  // Load initial data
  useEffect(() => {
    const loadExpenses = async () => {
      setIsLoading(true);
      try {
        const data = await storage.expenses.load();
        setExpenses(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError('Error loading expenses');
        console.error('Error loading expenses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadExpenses();
  }, []);

  // Save expenses whenever they change
  useEffect(() => {
    if (expenses.length > 0) {
      storage.expenses.save(expenses).catch(error => {
        console.error('Error saving expenses:', error);
      });
    }
  }, [expenses]);

  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense = {
      ...expenseData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'active'
    };
    setExpenses([...expenses, newExpense]);
    setShowExpenseForm(false);
  };

  const handleEditExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => 
        e.id === editingExpense.id ? { ...e, ...expenseData } : e
      ));
      setEditingExpense(undefined);
      setShowExpenseForm(false);
    }
  };

  const handleCancelExpense = (reason: string) => {
    if (cancellingExpense) {
      setExpenses(expenses.map(e =>
        e.id === cancellingExpense.id
          ? { ...e, status: 'cancelled', cancellationReason: reason }
          : e
      ));
      setCancellingExpense(undefined);
    }
  };

  const handleDeleteExpense = (password: string) => {
    if (password !== 'admin2019') {
      setDeleteError('Contraseña incorrecta');
      return;
    }

    if (deletingExpenseId) {
      setExpenses(expenses.filter(e => e.id !== deletingExpenseId));
      setDeletingExpenseId(undefined);
      setDeleteError('');
    }
  };

  const initiateDelete = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense?.status !== 'cancelled') {
      alert('Solo se pueden eliminar gastos cancelados');
      return;
    }
    setDeletingExpenseId(expenseId);
  };

  const handleAddCategory = (name: string) => {
    const newCategory = {
      id: Date.now().toString(),
      name
    };
    setCategories([...categories, newCategory]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && expenses.some(e => e.category === category.name)) {
      alert('No se puede eliminar una categoría que tiene gastos asociados');
      return;
    }
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      setCategories(categories.filter(c => c.id !== categoryId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gastos</h2>
        <div className="space-x-3">
          <button
            onClick={() => setShowCategoryManager(true)}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 flex items-center"
          >
            <Tags className="w-4 h-4 mr-2" />
            Gestionar Categorías
          </button>
          <button
            onClick={() => {
              setEditingExpense(undefined);
              setShowExpenseForm(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Gasto
          </button>
        </div>
      </div>

      {expenses.length > 0 ? (
        <ExpenseList
          expenses={expenses}
          onEdit={expense => {
            if (expense.status !== 'active') {
              alert('No se pueden editar gastos cancelados');
              return;
            }
            setEditingExpense(expense);
            setShowExpenseForm(true);
          }}
          onCancel={expense => setCancellingExpense(expense)}
          onDelete={initiateDelete}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No hay gastos registrados. Comienza agregando uno nuevo.
        </div>
      )}

      {showExpenseForm && (
        <ExpenseForm
          expense={editingExpense}
          categories={categories.map(c => c.name)}
          onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(undefined);
          }}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {cancellingExpense && (
        <CancelExpenseModal
          onConfirm={handleCancelExpense}
          onClose={() => setCancellingExpense(undefined)}
        />
      )}

      {deletingExpenseId && (
        <DeleteExpenseModal
          onConfirm={handleDeleteExpense}
          onClose={() => {
            setDeletingExpenseId(undefined);
            setDeleteError('');
          }}
        />
      )}
    </div>
  );
}