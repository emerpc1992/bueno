import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { LoginConfig, loadLoginConfig, saveLoginConfig, defaultConfig } from '../../utils/loginConfig';

export default function LoginSettings() {
  const [config, setConfig] = useState<LoginConfig>(() => {
    try {
      return loadLoginConfig();
    } catch (error) {
      console.error('Error loading config:', error);
      return defaultConfig;
    }
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update document title and favicon
      document.title = config.tabTitle;
      const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (favicon) {
        favicon.href = config.faviconUrl;
      }
      saveLoginConfig(config);
      setMessage('Configuración guardada correctamente');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage('Error al guardar la configuración');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <LogIn className="w-6 h-6 mr-2" />
        Apariencia
      </h2>

      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Apariencia</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Primario
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={config.colors.primary}
                    onChange={(e) => setConfig({
                      ...config,
                      colors: {
                        ...config.colors,
                        primary: e.target.value
                      }
                    })}
                    className="h-10 w-20 rounded border p-1"
                  />
                  <input
                    type="text"
                    value={config.colors.primary}
                    onChange={(e) => setConfig({
                      ...config,
                      colors: {
                        ...config.colors,
                        primary: e.target.value
                      }
                    })}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Color principal para botones y acentos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Secundario
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={config.colors.secondary}
                    onChange={(e) => setConfig({
                      ...config,
                      colors: {
                        ...config.colors,
                        secondary: e.target.value
                      }
                    })}
                    className="h-10 w-20 rounded border p-1"
                  />
                  <input
                    type="text"
                    value={config.colors.secondary}
                    onChange={(e) => setConfig({
                      ...config,
                      colors: {
                        ...config.colors,
                        secondary: e.target.value
                      }
                    })}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Color secundario para elementos decorativos
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL del Logo
              </label>
              <input
                type="url"
                value={config.logoUrl}
                onChange={(e) => setConfig({
                  ...config,
                  logoUrl: e.target.value
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://ejemplo.com/logo.png"
              />
              <p className="text-sm text-gray-500 mt-1">
                Recomendado: Imagen cuadrada con fondo transparente (PNG)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL del Favicon
              </label>
              <input
                type="url"
                value={config.faviconUrl}
                onChange={(e) => setConfig({
                  ...config,
                  faviconUrl: e.target.value
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://ejemplo.com/favicon.ico"
              />
              <p className="text-sm text-gray-500 mt-1">
                Icono que aparecerá en la pestaña del navegador (formatos: .ico, .png, .svg)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Imagen de Fondo
              </label>
              <input
                type="url"
                value={config.backgroundImage}
                onChange={(e) => setConfig({
                  ...config,
                  backgroundImage: e.target.value
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Recomendado: Usar imágenes de Unsplash con dimensiones grandes
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Configuración General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título de la Pestaña del Navegador
              </label>
              <input
                type="text"
                value={config.tabTitle}
                onChange={(e) => setConfig({
                  ...config,
                  tabTitle: e.target.value
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Título de la pestaña del navegador"
              />
              <p className="text-sm text-gray-500 mt-1">
                Este texto aparecerá en la pestaña del navegador
              </p>
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