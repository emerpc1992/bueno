import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import CategoryManager from './CategoryManager';
import { Product, Category } from '../../types/product';
import { storage } from '../../utils/storage';
import { exportToExcel, importFromExcel } from '../../utils/excel';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(() => []);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          storage.products.load(),
          storage.categories.load()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setError(null);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Error loading products');
        setProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save products whenever they change
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      storage.products.save(products).catch(error => {
        console.error('Error saving products:', error);
      });
    }
  }, [products, isLoading]);

  // Save categories whenever they change
  useEffect(() => {
    if (!isLoading && categories.length > 0) {
      storage.categories.save(categories).catch(error => {
        console.error('Error saving categories:', error);
      });
    }
  }, [categories, isLoading]);

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct = {
      ...productData,
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
    setShowProductForm(false);
  };

  const handleEditProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...productData, id: p.id } : p
      ));
      setEditingProduct(undefined);
      setShowProductForm(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      storage.products.save(updatedProducts).catch(error => {
        console.error('Error deleting product:', error);
        // Restore products if save fails
        setProducts(products);
        alert('Error al eliminar el producto. Por favor intente nuevamente.');
      });
    }
  };

  const handleAddCategory = (name: string) => {
    const newCategory = {
      id: Date.now().toString(),
      name,
    };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    storage.categories.save(updatedCategories).catch(error => {
      console.error('Error saving categories:', error);
      setCategories(categories); // Restore previous state if save fails
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && products.some(p => p.category === category.name)) {
      alert('No se puede eliminar una categoría que tiene productos asociados');
      return;
    }
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      const updatedCategories = categories.filter(c => c.id !== categoryId);
      setCategories(updatedCategories);
      storage.categories.save(updatedCategories).catch(error => {
        console.error('Error saving categories after deletion:', error);
        setCategories(categories); // Restore previous state if save fails
      });
    }
  };

  const handleExportExcel = () => {
    exportToExcel(products);
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedProducts = await importFromExcel(file);
      
      // Check for duplicate codes
      const duplicateCodes = importedProducts.filter(newProduct => 
        products.some(existingProduct => existingProduct.code === newProduct.code)
      ).map(p => p.code);

      if (duplicateCodes.length > 0) {
        alert(`Los siguientes códigos ya existen:\n${duplicateCodes.join('\n')}`);
        return;
      }

      setProducts([...products, ...importedProducts]);
      alert('Productos importados correctamente');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al importar productos');
    }

    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
        <div className="space-x-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 flex items-center inline-flex"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </button>
          <label className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer inline-flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Importar Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowCategoryManager(true)}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
          >
            Gestionar Categorías
          </button>
          <button
            onClick={() => {
              setEditingProduct(undefined);
              setShowProductForm(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {products.length > 0 ? (
        <ProductList
          products={products}
          onEdit={(product) => {
            setEditingProduct(product);
            setShowProductForm(true);
          }}
          onDelete={handleDeleteProduct}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No hay productos registrados. Comienza agregando uno nuevo.
        </div>
      )}

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories.map(c => c.name)}
          onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(undefined);
          }}
          existingCodes={products.map(p => p.code)}
        />
      )}

      {showCategoryManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <CategoryManager
                categories={categories}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowCategoryManager(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}