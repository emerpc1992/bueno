import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ExpenseCategory } from '../../types/expense';

interface CategoryManagerProps {
  categories: ExpenseCategory[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onClose: () => void;
}

export default function CategoryManager({ categories, onAddCategory, onDeleteCategory, onClose }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }
    if (categories.some(cat => cat.name.toLowerCase() === newCategory.toLowerCase())) {
      setError('Esta categoría ya existe');
      return;
    }
    onAddCategory(newCategory);
    setNewCategory('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Gestionar Categorías de Gastos
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nueva categoría"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </button>
          </form>

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">{category.name}</span>
                <button
                  onClick={() => onDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}