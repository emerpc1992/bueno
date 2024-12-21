import React from 'react';
import { loadLoginConfig } from '../utils/loginConfig';
import {
  Package,
  ShoppingCart,
  Users, UserCircle,
  DollarSign,
  Calendar,
  CreditCard,
  BarChart2,
  Settings, Printer, Wallet, Palette, Database,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  userRole: string;
  username: string;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

const baseAdminMenuItems = [
  { icon: Package, label: 'Productos', path: 'products' },
  { icon: ShoppingCart, label: 'Ventas', path: 'sales' },
  { icon: UserCircle, label: 'Colaboradores', path: 'staff' },
  { icon: Users, label: 'Clientes', path: 'clients' },
  { icon: DollarSign, label: 'Gastos', path: 'expenses' },
  { icon: Calendar, label: 'Citas', path: 'appointments' },
  { icon: CreditCard, label: 'Créditos', path: 'credits' },
  { icon: BarChart2, label: 'Reportes', path: 'reports' },
  { icon: Printer, label: 'Facturas', path: 'receipts' },
  { icon: Settings, label: 'Configuración', path: 'settings' },
  { icon: Wallet, label: 'Caja Chica', path: 'cash' },
];

const masterAdminMenuItems = [
  ...baseAdminMenuItems,
  { icon: Palette, label: 'Apariencia', path: 'appearance' },
  { icon: Database, label: 'Base de Datos', path: 'database' },
];

export default function Sidebar({ userRole, username, onLogout, onNavigate }: SidebarProps) {
  const config = loadLoginConfig();

  const vendorMenuItems = [
    { icon: ShoppingCart, label: 'Ventas', path: 'sales' },
    { icon: Users, label: 'Clientes', path: 'clients' },
    { icon: DollarSign, label: 'Gastos', path: 'expenses' },
    { icon: Calendar, label: 'Citas', path: 'appointments' },
    { icon: CreditCard, label: 'Créditos', path: 'credits' },
    { icon: BarChart2, label: 'Reportes', path: 'reports' },
    { icon: Wallet, label: 'Caja Chica', path: 'cash' },
  ];

  // Use different menu items based on user role
  const menuItems = (() => {
    if (userRole === 'admin') {
      // Check if it's masteradmin
      return username === 'masteradmin' ? masterAdminMenuItems : baseAdminMenuItems; 
    }
    return vendorMenuItems;
  })();

  return (
    <div className="bg-white h-screen w-64 shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold" style={{ color: config.colors.primary }}>{config.businessInfo.name}</h2>
        <p className="text-sm text-gray-600">{config.businessInfo.subtitle}</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => onNavigate(item.path)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg transition-colors"
                style={{
                  '&:hover': {
                    backgroundColor: `${config.colors.primary}10`,
                    color: config.colors.primary
                  }
                }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}