import React from 'react';
import Sidebar from './Sidebar';
import Settings from './Settings';
import Products from './Products';
import Clients from './Clients';
import Reports from './Reports';
import Sales from './Sales';
import StaffManager from './Staff';
import Appointments from './Appointments';
import LoginSettings from './Settings/LoginSettings';
import Expenses from './Expenses';
import Credits from './Credits';
import ReceiptSettings from './Settings/ReceiptSettings';
import CashRegister from './CashRegister';
import DatabaseSettings from './Settings/DatabaseSettings';

interface DashboardProps {
  user: { username: string; role: string };
  onLogout: () => void;
}

interface RouteConfig {
  Component: React.ComponentType<any>;
  props: Record<string, any>;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentPath, setCurrentPath] = React.useState('dashboard');

  const baseAdminRoutes: Record<string, RouteConfig> = {
    settings: {
      Component: Settings,
      props: { userRole: user.role }
    },
    products: {
      Component: Products,
      props: {}
    },
    sales: {
      Component: Sales,
      props: {}
    },
    clients: {
      Component: Clients,
      props: {}
    },
    reports: {
      Component: Reports,
      props: { userRole: user.role }
    },
    staff: {
      Component: StaffManager,
      props: {}
    },
    appointments: {
      Component: Appointments,
      props: { userRole: user.role }
    },
    expenses: {
      Component: Expenses,
      props: {}
    },
    credits: {
      Component: Credits,
      props: {}
    },
    receipts: {
      Component: ReceiptSettings,
      props: {}
    },
    cash: {
      Component: CashRegister,
      props: {}
    },
  };

  const masterAdminRoutes: Record<string, RouteConfig> = {
    ...baseAdminRoutes,
    appearance: {
      Component: LoginSettings,
      props: {}
    },
    database: {
      Component: DatabaseSettings,
      props: {}
    }
  };

  const vendorRoutes: Record<string, RouteConfig> = {
    sales: {
      Component: Sales,
      props: {}
    },
    clients: {
      Component: Clients,
      props: {}
    },
    expenses: {
      Component: Expenses,
      props: {}
    },
    appointments: {
      Component: Appointments,
      props: { userRole: user.role }
    },
    credits: {
      Component: Credits,
      props: {}
    },
    reports: {
      Component: Reports,
      props: { userRole: user.role }
    },
    cash: {
      Component: CashRegister,
      props: {}
    }
  };

  const superRoutes: Record<string, RouteConfig> = {
    ...masterAdminRoutes,
    database: {
      Component: DatabaseSettings,
      props: {}
    }
  };

  const routes = (() => {
    if (user.role === 'admin') {
      // Check if it's masteradmin
      return user.username === 'masteradmin' ? masterAdminRoutes : baseAdminRoutes;
    }
    return vendorRoutes;
  })();

  const handleNavigation = (path: string) => {
    if (routes[path]) {
      setCurrentPath(path);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        userRole={user.role} 
        username={user.username}
        onLogout={onLogout} 
        onNavigate={handleNavigation} 
      />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Bienvenido, {user.username}</h1>
          <p className="text-gray-600">Rol: {
            user.role === 'admin' ? 'Administrador' : 
            'Vendedor'
          }</p>
        </div>
        
        {currentPath === 'dashboard' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Selecciona una opción del menú lateral para comenzar.</p>
          </div>
        ) : routes[currentPath] ? (
          React.createElement(routes[currentPath].Component, routes[currentPath].props)
        ) : null}
      </main>
    </div>
  );
}