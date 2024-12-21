import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import { ReceiptConfig, loadReceiptConfig, saveReceiptConfig } from '../../utils/receiptConfig';

export default function ReceiptSettings() {
  const [config, setConfig] = useState<ReceiptConfig>(loadReceiptConfig());
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveReceiptConfig(config);
    setMessage('Configuración guardada correctamente');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <Printer className="w-5 h-5 mr-2" />
        Configuración de Facturas
      </h2>

      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Tamaño del Papel</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ancho (mm)
                </label>
                <input
                  type="number"
                  value={config.paperSize.width}
                  onChange={(e) => setConfig({
                    ...config,
                    paperSize: {
                      ...config.paperSize,
                      width: Number(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Tamaño de Fuente</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="number"
                  value={config.fontSize.title}
                  onChange={(e) => setConfig({
                    ...config,
                    fontSize: {
                      ...config.fontSize,
                      title: Number(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtítulo
                </label>
                <input
                  type="number"
                  value={config.fontSize.subtitle}
                  onChange={(e) => setConfig({
                    ...config,
                    fontSize: {
                      ...config.fontSize,
                      subtitle: Number(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto General
                </label>
                <input
                  type="number"
                  value={config.fontSize.body}
                  onChange={(e) => setConfig({
                    ...config,
                    fontSize: {
                      ...config.fontSize,
                      body: Number(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información del Negocio</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={config.businessInfo.name}
                onChange={(e) => setConfig({
                  ...config,
                  businessInfo: {
                    ...config.businessInfo,
                    name: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtítulo
              </label>
              <input
                type="text"
                value={config.businessInfo.subtitle}
                onChange={(e) => setConfig({
                  ...config,
                  businessInfo: {
                    ...config.businessInfo,
                    subtitle: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección (opcional)
              </label>
              <input
                type="text"
                value={config.businessInfo.address || ''}
                onChange={(e) => setConfig({
                  ...config,
                  businessInfo: {
                    ...config.businessInfo,
                    address: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono (opcional)
              </label>
              <input
                type="text"
                value={config.businessInfo.phone || ''}
                onChange={(e) => setConfig({
                  ...config,
                  businessInfo: {
                    ...config.businessInfo,
                    phone: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (opcional)
              </label>
              <input
                type="email"
                value={config.businessInfo.email || ''}
                onChange={(e) => setConfig({
                  ...config,
                  businessInfo: {
                    ...config.businessInfo,
                    email: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
}