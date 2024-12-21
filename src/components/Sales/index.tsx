import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import SalesList from './SalesList';
import SaleForm from './SaleForm';
import DeleteAllSalesModal from './DeleteAllSalesModal';
import CancelSaleModal from './CancelSaleModal';
import DeleteSaleModal from './DeleteSaleModal';
import { Sale } from '../../types/sale';
import { Product } from '../../types/product';
import { Staff } from '../../types/staff';
import { Client } from '../../types/client';
import { storage } from '../../utils/storage';
import DateRangeSelector from '../Reports/DateRangeSelector';
import { updateProductQuantity } from '../../utils/inventory';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [cancellingSale, setCancellingSale] = useState<Sale | undefined>();
  const [deletingSaleId, setDeletingSaleId] = useState<string | undefined>();
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Default to last month
    return date.toISOString().split('T')[0];
  });
  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [filteredSales, setFilteredSales] = useState<Sale[]>(sales);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [salesData, productsData, staffData, loadedClients] = await Promise.all([
          storage.sales.load(),
          storage.products.load(),
          storage.staff.load(),
          storage.clients.load()
        ]);
        setSales(salesData);
        setProducts(productsData);
        setStaff(staffData);
        setClients(loadedClients);
        setClientsData(loadedClients);
        setError(null);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error loading data');
        setSales([]);
        setProducts([]);
        setStaff([]);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (!isLoading) {
      storage.sales.save(sales);
    }
  }, [sales, isLoading]);

  // Filter sales whenever dates or sales change
  useEffect(() => {
    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.date).setHours(0, 0, 0, 0);
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      return saleDate >= start && saleDate <= end;
    });
    setFilteredSales(filtered);
  }, [sales, startDate, endDate]);
  // Save staff whenever they change
  useEffect(() => {
    storage.staff.save(staff);
  }, [staff]);

  // Save products whenever they change
  useEffect(() => {
    if (products.length > 0) {
      storage.products.save(products).catch(error => {
        console.error('Error saving products:', error);
      });
    }
  }, [products]);

  const handleAddSale = async (saleData: Omit<Sale, 'id' | 'date'>) => {
    try {
      // Get the highest invoice number and increment by 1
      const lastInvoiceNumber = sales.reduce((max, sale) => 
        Math.max(max, sale.invoiceNumber || 0), 0);

      // Create new sale
      const newSale = {
        ...saleData,
        id: Date.now().toString(),
        invoiceNumber: lastInvoiceNumber + 1,
        date: new Date().toISOString(),
        status: 'active' as const
      };

      // Update client purchase history if client code exists
      if (saleData.clientCode) {
        const updatedClients = clientsData.map(client => {
          if (client.code === saleData.clientCode) {
            const newPurchase = {
              id: newSale.id,
              date: newSale.date,
              total: newSale.total,
              products: newSale.products.map(p => ({
                id: p.id,
                name: p.name,
                quantity: p.quantity,
                price: p.finalPrice
              }))
            };

            return {
              ...client,
              purchases: [...(client.purchases || []), newPurchase]
            };
          }
          return client;
        });

        // Save updated clients
        try {
          await storage.clients.save(updatedClients);
          setClients(updatedClients);
        } catch (error) {
          console.error('Error saving client purchase:', error);
        }
        setClientsData(updatedClients);
      }

      if (!Array.isArray(sales)) {
        console.error('Sales is not initialized properly');
        alert('Error: Sistema no inicializado correctamente');
        return;
      }

      const quantityChanges = saleData.products.map(product => ({
        id: product.id,
        quantity: -product.quantity
      }));

      const updatedProducts = updateProductQuantity(products, quantityChanges);
      setProducts(updatedProducts);

      try {
        // Update sales list
        const updatedSales = [...sales, newSale];
        await storage.sales.save(updatedSales);
        setSales(updatedSales);

        // Update staff sales and commission records if staff is assigned
        if (newSale.staffId) {
          const updatedStaff = staff.map(s => {
            if (s.id === newSale.staffId) {
              return {
                ...s,
                sales: [...s.sales, {
                  id: newSale.id,
                  date: newSale.date,
                  total: newSale.total,
                  commission: newSale.staffCommission || 0,
                  commissionPaid: false,
                  products: newSale.products.map(p => ({
                    id: p.id,
                    name: p.name,
                    quantity: p.quantity,
                    price: p.finalPrice
                  }))
                }]
              };
            }
            return s;
          });
          await storage.staff.save(updatedStaff);
          setStaff(updatedStaff);
        }

        setShowSaleForm(false);
      } catch (error) {
        console.error('Error saving sale:', error);
        alert('Error al guardar la venta. Los cambios serán revertidos.');
        // Revert changes
        setProducts(products);
        setClients(clients);
        setStaff(staff);
      }

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar el inventario');
    }
  };

  const handleCancelSale = (reason: string) => {
    if (cancellingSale) {
      // Restore product quantities
      const updatedProducts = products.map(product => {
        const saleProduct = cancellingSale.products.find(p => p.id === product.id);
        if (saleProduct) {
          return {
            ...product,
            quantity: product.quantity + saleProduct.quantity
          };
        }
        return product;
      });
      setProducts(updatedProducts);

      // Update the sale status and staff commission
      const updatedSales = sales.map(sale => {
        if (sale.id === cancellingSale.id) {
          // If there's a staff discount, mark it as cancelled too
          const updatedSale = { ...sale, status: 'cancelled', cancellationReason: reason };
          if (updatedSale.staffDiscount) {
            updatedSale.staffDiscount = {
              ...updatedSale.staffDiscount,
              status: 'cancelled',
              cancellationReason: reason
            };
          }
          return updatedSale;
        }
        return sale;
      });
      setSales(updatedSales);

      // Update staff member's sales record
      if (cancellingSale.staffId) {
        const updatedStaff = staff.map(s => {
          if (s.id === cancellingSale.staffId) {
            // Remove the sale from staff records when cancelled
            return {
              ...s,
              sales: s.sales.filter(sale => sale.id !== cancellingSale.id)
            };
          }
          return s;
        });
        setStaff(updatedStaff);
        storage.staff.save(updatedStaff);
      }

      setCancellingSale(undefined);
    }
  };

  const handleDeleteSale = (password: string) => {
    if (password !== 'admin2019') {
      setDeleteError('Contraseña incorrecta');
      return;
    }
    setSales(sales.filter(s => s.id !== deletingSaleId));
    setDeletingSaleId(undefined);
  };
  const handleDeleteAllSales = async (password: string) => {
    if (password !== 'admin2019') {
      setDeleteError('Contraseña incorrecta');
      return;
    }
    
    try {
      // Clear sales array
      const clearedSales: Sale[] = [];
      await storage.sales.save(clearedSales);
      setSales(clearedSales);
      setFilteredSales(clearedSales);
      setShowDeleteAllModal(false);
      setDeleteError('');
    } catch (error) {
      console.error('Error deleting all sales:', error);
      setDeleteError('Error al eliminar las ventas');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-800">Ventas</h2>
          <button
            onClick={() => setShowSaleForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </button>
          <button
            onClick={() => setShowDeleteAllModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Eliminar Todo
          </button>
        </div>
        <div className="flex-shrink-0">
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSearch={() => {}} // No need for explicit search since we use useEffect
          />
        </div>
      </div>

      {filteredSales.length > 0 ? (
        <SalesList
          sales={filteredSales}
          onCancel={setCancellingSale}
          onDelete={setDeletingSaleId} />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          {sales.length > 0 
            ? 'No hay ventas en el rango de fechas seleccionado.'
            : 'No hay ventas registradas. Comienza agregando una nueva.'
          }
        </div>
      )}

      {showSaleForm && (
        <SaleForm
          products={products}
          staff={staff}
          clients={clients}
          onSubmit={handleAddSale}
          onClose={() => setShowSaleForm(false)}
        />
      )}

      {cancellingSale && (
        <CancelSaleModal
          onConfirm={handleCancelSale}
          onClose={() => setCancellingSale(undefined)}
        />
      )}

      {deletingSaleId && (
        <DeleteSaleModal
          onConfirm={handleDeleteSale}
          onClose={() => {
            setDeletingSaleId(undefined);
            setDeleteError('');
          }}
          error={deleteError} />
      )}
      
      {showDeleteAllModal && (
        <DeleteAllSalesModal
          onConfirm={handleDeleteAllSales}
          onClose={() => {
            setShowDeleteAllModal(false);
            setDeleteError('');
          }}
          error={deleteError}
        />
      )}
    </div>
  );
}