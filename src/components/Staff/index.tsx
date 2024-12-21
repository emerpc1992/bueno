import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import StaffList from './StaffList';
import StaffForm from './StaffForm';
import StaffHistory from './StaffHistory';
import AddDiscountModal from './AddDiscountModal';
import CancelDiscountModal from './CancelDiscountModal';
import DeleteStaffModal from './DeleteStaffModal';
import { Staff } from '../../types/staff';
import { storage } from '../../utils/storage';

export default function StaffManager() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>();
  const [selectedSale, setSelectedSale] = useState<{
    staffId: string;
    saleId: string;
    commission: number;
  } | undefined>();
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>();
  const [cancellingDiscountId, setCancellingDiscountId] = useState<string | undefined>();
  const [discountingStaff, setDiscountingStaff] = useState<Staff | undefined>();
  const [deletingStaffId, setDeletingStaffId] = useState<string | undefined>();
  const [deleteError, setDeleteError] = useState('');

  // Load initial data
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const data = await storage.staff.load();
        if (Array.isArray(data)) {
          setStaff(data);
        }
      } catch (error) {
        console.error('Error loading staff:', error);
        setStaff([]);
      }
    };
    loadStaff();
  }, []);

  // Save staff whenever they change
  useEffect(() => {
    if (staff.length > 0) {
      storage.staff.save(staff).catch(error => {
        console.error('Error saving staff:', error);
      });
    }
  }, [staff]);

  const handleAddStaff = (staffData: Omit<Staff, 'id' | 'sales' | 'discounts'>) => {
    const newStaff = {
      ...staffData,
      id: Date.now().toString(),
      sales: [],
      discounts: []
    };
    setStaff([...staff, newStaff]);
    setShowStaffForm(false);
  };

  const handleEditStaff = (staffData: Omit<Staff, 'id' | 'sales' | 'discounts'>) => {
    if (editingStaff) {
      setStaff(staff.map(s => 
        s.id === editingStaff.id ? { ...s, ...staffData } : s
      ));
      setEditingStaff(undefined);
      setShowStaffForm(false);
    }
  };

  const handleAddDiscount = (amount: number, reason: string) => {
    if (discountingStaff) {
      const discount = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount,
        reason,
        status: 'active' as const,
      };

      setStaff(staff.map(s =>
        s.id === discountingStaff.id
          ? {
              ...s,
              discounts: [...s.discounts, discount]
            }
          : s
      ));
      setDiscountingStaff(undefined);
    }
  };

  const handleDeleteStaff = (password: string) => {
    if (password !== 'admin2019') {
      setDeleteError('Contraseña incorrecta');
      return;
    }

    if (deletingStaffId) {
      const updatedStaff = staff.filter(s => s.id !== deletingStaffId);
      setStaff(updatedStaff);
      storage.staff.save(updatedStaff).catch(error => {
        console.error('Error saving staff after deletion:', error);
        // Restore the staff member if save fails
        setStaff(staff);
        alert('Error al eliminar el colaborador. Por favor intente nuevamente.');
      });
      setDeletingStaffId(undefined);
      setDeleteError('');
    }
  };

  const handleUpdateSale = (staffId: string, saleId: string, commissionPaid: boolean) => {
    setStaff(staff.map(s =>
      s.id === staffId
        ? {
            ...s,
            sales: s.sales.map(sale =>
              sale.id === saleId
                ? { ...sale, commissionPaid }
                : sale
            )
          }
        : s
    ));
  };

  const handleCancelDiscount = (reason: string) => {
    if (selectedSale) {
      // Update sales record
      const updatedSales = storage.sales.load().map(sale => {
        if (sale.id === selectedSale.saleId) {
          return {
            ...sale,
            staffDiscount: sale.staffDiscount ? {
              ...sale.staffDiscount,
              status: 'cancelled',
              cancellationReason: reason
            } : undefined
          };
        }
        return sale;
      });
      storage.sales.save(updatedSales);

      // Update staff record
      setStaff(staff.map(s =>
        s.id === selectedSale.staffId
          ? {
              ...s,
              sales: s.sales.map(sale =>
                sale.id === selectedSale.saleId && sale.discount
                  ? {
                      ...sale,
                      discount: {
                        ...sale.discount,
                        status: 'cancelled',
                        cancellationReason: reason
                      }
                    }
                  : sale
              )
            }
          : s
      ));
      setSelectedSale(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Colaboradores</h2>
        <button
          onClick={() => {
            setEditingStaff(undefined);
            setShowStaffForm(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Colaborador
        </button>
      </div>

      {staff.length > 0 ? (
        <StaffList
          staff={staff}
          onEdit={(member) => {
            setEditingStaff(member);
            setShowStaffForm(true);
          }}
          onDelete={(staffId) => setDeletingStaffId(staffId)}
          onViewHistory={(member) => setSelectedStaff(member)}
          onAddDiscount={(member) => setDiscountingStaff(member)}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No hay colaboradores registrados . Comienza agregando uno nuevo.
        </div>
      )}

      {showStaffForm && (
        <StaffForm
          staff={editingStaff}
          onSubmit={editingStaff ? handleEditStaff : handleAddStaff}
          onClose={() => {
            setShowStaffForm(false);
            setEditingStaff(undefined);
          }}
          existingCodes={staff.map(s => s.code)}
        />
      )}

      {selectedStaff && (
        <StaffHistory
          staff={selectedStaff}
          onUpdateSale={(saleId, commissionPaid) => 
            handleUpdateSale(selectedStaff.id, saleId, commissionPaid)
          }
          onCancelDiscount={setCancellingDiscountId}
          onClose={() => setSelectedStaff(undefined)}
        />
      )}

      {discountingStaff && (
        <AddDiscountModal
          onConfirm={handleAddDiscount}
          onClose={() => setDiscountingStaff(undefined)}
        />
      )}

      {deletingStaffId && (
        <DeleteStaffModal
          onConfirm={handleDeleteStaff}
          onClose={() => {
            setDeletingStaffId(undefined);
            setDeleteError('');
          }}
          error={deleteError}
        />
      )}
      
      {cancellingDiscountId && (
        <CancelDiscountModal
          onConfirm={handleCancelDiscount}
          onClose={() => setCancellingDiscountId(undefined)}
        />
      )}
    </div>
  );
}