import React from 'react';
import { DollarSign, CreditCard, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface FinancialSummaryProps {
  inventoryCost: number;
  totalSales: number;
  totalExpenses: number;
  costOfSales: number;
  netProfit: number;
  cashBalance: number;
  cashBalance: number;
  cashPayments: number;
  cardPayments: number;
  transferPayments: number;
  creditTotal: number;
  creditPaid: number;
  creditPending: number;
  creditProfit: number;
}

export default function FinancialSummary({
  inventoryCost,
  totalSales,
  totalExpenses,
  costOfSales,
  netProfit,
  cashBalance,
  cashPayments,
  cardPayments,
  transferPayments,
  creditTotal,
  creditPaid,
  creditPending,
  creditProfit
}: FinancialSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cash Balance */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Dinero en Caja</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ventas Totales</span>
              <span className="font-medium">{formatCurrency(totalSales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gastos</span>
              <span className="font-medium text-red-600">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Balance en Caja</span>
                <span className={`font-bold text-lg ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cashBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sales and Profit */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Ventas y Ganancias Directas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ventas Totales</span>
              <span className="font-medium">{formatCurrency(totalSales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Costo de Ventas</span>
              <span className="font-medium text-red-600">-{formatCurrency(costOfSales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gastos</span>
              <span className="font-medium text-red-600">-{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Ganancia Neta</span>
                <span className={`font-bold text-lg ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Credit Profits */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Ganancias en Créditos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ventas en Crédito</span>
              <span className="font-medium">{formatCurrency(creditTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Costo Original</span>
              <span className="font-medium text-red-600">-{formatCurrency(creditTotal - creditProfit)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Ganancia Realizada</span>
                <span className="font-bold text-green-600">{formatCurrency(creditProfit)}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Basado en pagos recibidos: {formatCurrency(creditPaid)}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Métodos de Pago</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wallet className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-600">Efectivo</span>
              </div>
              <span className="font-medium">{formatCurrency(cashPayments)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-gray-600">Tarjeta</span>
              </div>
              <span className="font-medium">{formatCurrency(cardPayments)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUpRight className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-gray-600">Transferencia</span>
              </div>
              <span className="font-medium">{formatCurrency(transferPayments)}</span>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Créditos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total en Créditos</span>
              <span className="font-medium">{formatCurrency(creditTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pagado</span>
              <span className="font-medium text-green-600">{formatCurrency(creditPaid)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pendiente</span>
              <span className="font-medium text-yellow-600">{formatCurrency(creditPending)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600">Ganancia en Créditos</span>
              <span className="font-medium text-green-600">{formatCurrency(creditProfit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Inventario</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
            <span className="text-gray-600">Valor Total del Inventario</span>
          </div>
          <span className="font-medium">{formatCurrency(inventoryCost)}</span>
        </div>
      </div>
    </div>
  );
}