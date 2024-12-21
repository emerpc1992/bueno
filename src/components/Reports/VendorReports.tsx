import React from 'react';
import { DollarSign, CreditCard, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import DateRangeSelector from './DateRangeSelector';

interface VendorReportsProps {
  metrics: {
    totalSales: number;
    creditTotal: number;
    totalExpenses: number;
    cashPayments: number;
    cardPayments: number;
    transferPayments: number;
  };
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSearch: () => void;
}

export default function VendorReports({
  metrics,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch
}: VendorReportsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Reportes</h2>
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          onSearch={onSearch}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sales Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Ventas Totales</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(metrics.totalSales)}</p>
        </div>

        {/* Credits Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total en Créditos</h3>
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(metrics.creditTotal)}</p>
        </div>

        {/* Expenses Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Gastos Totales</h3>
            <Wallet className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(metrics.totalExpenses)}</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métodos de Pago</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Efectivo</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.cashPayments)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Tarjeta</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.cardPayments)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Transferencia</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.transferPayments)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}