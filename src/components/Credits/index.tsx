import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import CreditList from './CreditList';
import CreditForm from './CreditForm';
import PaymentModal from './PaymentModal';
import CancelCreditModal from './CancelCreditModal';
import DeleteCreditModal from './DeleteCreditModal';
import PaymentHistory from './PaymentHistory';
import { Credit } from '../../types/credit';
import { Product } from '../../types/product';
import { storage } from '../../utils/storage';
import { updateProductQuantity } from '../../utils/inventory';

export default function Credits() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(() => storage.products.load());
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<Credit | undefined>();
  const [payingCredit, setPayingCredit] = useState<Credit | undefined>();
  const [cancellingCredit, setCancellingCredit] = useState<Credit | undefined>();
  const [deletingCreditId, setDeletingCreditId] = useState<string | undefined>();
  const [deleteError, setDeleteError] = useState('');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [creditsData, productsData] = await Promise.all([
          storage.credits.load(),
          storage.products.load()
        ]);
        setCredits(creditsData);
        setProducts(productsData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error loading data');
        setCredits([]);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (!isLoading && credits.length > 0) {
      storage.credits.save(credits).catch(error => {
        console.error('Error saving credits:', error);
      });
    }
  }, [credits, isLoading]);

  // Save products whenever they change
  useEffect(() => {
    if (products.length > 0) {
      storage.products.save(products).catch(error => {
        console.error('Error saving products:', error);
      });
    }
  }, [products]);

  const handleAddCredit = (creditData: Omit<Credit, 'id' | 'payments' | 'status' | 'createdAt'>) => {
    // Update product quantity
    const updatedProducts = updateProductQuantity(products, [{
      id: creditData.productId,
      quantity: -1 // Decrease by 1 since credit is for single product
    }]);
    setProducts(updatedProducts);

    const newCredit = {
      ...creditData,
      id: Date.now().toString(),
      payments: [],
      status: 'active' as const,
      createdAt: new Date().toISOString()
    };
    setCredits([...credits, newCredit]);
    setShowCreditForm(false);
  };

  const handleAddPayment = (paymentData: {
    amount: number;
    method: 'cash' | 'card' | 'transfer';
    reference?: string;
  }) => {
    if (payingCredit) {
      const newPayment = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ...paymentData
      };

      const updatedCredits = credits.map(credit => {
        if (credit.id === payingCredit.id) {
          const totalPaid = [...credit.payments, newPayment]
            .reduce((sum, payment) => sum + payment.amount, 0);
          
          let status: Credit['status'] = credit.status;
          if (totalPaid >= credit.finalPrice) {
            status = 'completed';
          } else if (new Date(credit.dueDate) < new Date()) {
            status = 'overdue';
          }

          return {
            ...credit,
            payments: [...credit.payments, newPayment],
            status
          };
        }
        return credit;
      });

      setCredits(updatedCredits);
      setPayingCredit(undefined);
    }
  };

  const handleCancelCredit = (reason: string) => {
    if (cancellingCredit) {
      // Only restore product quantity if credit is active
      if (cancellingCredit.status === 'active') {
        // Restore product quantity
        const updatedProducts = updateProductQuantity(products, [{
          id: cancellingCredit.productId,
          quantity: 1 // Increase by 1 to restore inventory
        }]);
        setProducts(updatedProducts);
      }

      // Update credit status
      setCredits(credits.map(credit =>
        credit.id === cancellingCredit.id
          ? { ...credit, status: 'cancelled', cancellationReason: reason }
          : credit
      ));
      setCancellingCredit(undefined);
    }
  };

  const handleDeleteCredit = (password: string) => {
    if (password !== 'admin2019') {
      setDeleteError('Contraseña incorrecta');
      return;
    }

    if (deletingCreditId) {
      setCredits(credits.filter(c => c.id !== deletingCreditId));
      setDeletingCreditId(undefined);
      setDeleteError('');
    }
  };

  const initiateDelete = (creditId: string) => {
    const credit = credits.find(c => c.id === creditId);
    if (credit?.status === 'active') {
      alert('Solo se pueden eliminar créditos completados o cancelados');
      return;
    }
    setDeletingCreditId(creditId);
  };

  const calculateRemainingAmount = (credit: Credit) => {
    const totalPaid = credit.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return credit.finalPrice - totalPaid;
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
        <h2 className="text-2xl font-bold text-gray-800">Créditos</h2>
        <button
          onClick={() => setShowCreditForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Crédito
        </button>
      </div>

      {credits.length > 0 ? (
        <CreditList
          credits={credits}
          onCancel={setCancellingCredit}
          onDelete={initiateDelete}
          onMakePayment={setPayingCredit}
          onViewHistory={setSelectedCredit}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No hay créditos registrados. Comienza agregando uno nuevo.
        </div>
      )}

      {showCreditForm && (
        <CreditForm
          products={products}
          onSubmit={handleAddCredit}
          onClose={() => setShowCreditForm(false)}
          existingCodes={credits.map(c => c.code)}
        />
      )}

      {payingCredit && (
        <PaymentModal
          creditId={payingCredit.id}
          remainingAmount={calculateRemainingAmount(payingCredit)}
          onSubmit={handleAddPayment}
          onClose={() => setPayingCredit(undefined)}
        />
      )}

      {selectedCredit && (
        <PaymentHistory
          credit={selectedCredit}
          onClose={() => setSelectedCredit(undefined)}
        />
      )}
      
      {cancellingCredit && (
        <CancelCreditModal
          onConfirm={handleCancelCredit}
          onClose={() => setCancellingCredit(undefined)}
        />
      )}
      
      {deletingCreditId && (
        <DeleteCreditModal
          onConfirm={handleDeleteCredit}
          onClose={() => {
            setDeletingCreditId(undefined);
            setDeleteError('');
          }}
          error={deleteError}
        />
      )}
    </div>
  );
}