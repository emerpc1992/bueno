import React from 'react';
import { Edit, Trash2, History, DollarSign } from 'lucide-react';
import { Staff } from '../../types/staff';
import { formatCurrency } from '../../utils/format';

interface StaffListProps {
  staff: Staff[];
  onEdit: (staff: Staff) => void;
  onDelete: (staffId: string) => void;
  onViewHistory: (staff: Staff) => void;
  onAddDiscount: (staff: Staff) => void;
}

export default function StaffList({ staff, onEdit, onDelete, onViewHistory, onAddDiscount }: StaffListProps) {
  const calculateTotalCommission = (staff: Staff) => {
    // Only include active sales in commission calculations
    const activeSales = staff.sales;
    
    // Calculate total commissions
    const totalCommissions = activeSales.reduce((total, sale) => 
      total + sale.commission, 0);

    // Only count active discounts
    const totalDiscounts = staff.discounts
      .filter(discount => discount.status === 'active')
      .reduce((total, discount) => total + discount.amount, 0);

    return {
      totalCommissions,
      totalDiscounts,
      total: totalCommissions - totalDiscounts
    };
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ventas</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {staff.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.commissionRate}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(member.sales.reduce((total, sale) => total + sale.total, 0))}
                <div className="text-xs text-gray-500">
                  {member.sales.length} ventas realizadas
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(calculateTotalCommission(member).total)}
                {member.discounts.length > 0 && (
                  <div className="text-xs text-red-500">
                    {member.discounts.filter(d => d.status === 'active').length} descuentos activos<br />
                    {member.sales.filter(s => !s.commissionPaid).length} comisiones pendientes
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewHistory(member)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Ver historial"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onAddDiscount(member)}
                    className="text-yellow-600 hover:text-yellow-900"
                    title="Agregar descuento"
                  >
                    <DollarSign className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(member)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(member.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}