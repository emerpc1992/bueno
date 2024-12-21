export interface LoginConfig {
  backgroundImage: string;
  logoUrl: string;
  faviconUrl: string;
  tabTitle: string;
  colors: {
    primary: string;
    secondary: string;
  };
  businessInfo: {
    name: string;
    subtitle: string;
  };
}

// Default configuration
export const defaultConfig: LoginConfig = {
  backgroundImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2087&auto=format&fit=crop',
  logoUrl: '',
  faviconUrl: '/vite.svg',
  tabTitle: 'Alvaro Rugama - Sistema de Gestión',
  colors: {
    primary: '#7C3AED',  // purple-600
    secondary: '#4F46E5'  // indigo-600
  },
  businessInfo: {
    name: 'Alvaro Rugama',
    subtitle: 'Make Up Studio & Beauty Salon'
  }
};

// Save configuration to localStorage
export const saveLoginConfig = (config: LoginConfig) => {
  localStorage.setItem('loginConfig', JSON.stringify(config));
};

// Load configuration from localStorage with type safety
export const loadLoginConfig = (): LoginConfig => {
  try {
    const saved = localStorage.getItem('loginConfig');
    if (!saved) return defaultConfig;
    
    const config = JSON.parse(saved) as Partial<LoginConfig>;
    
    // Ensure all required properties exist
    return {
      backgroundImage: config.backgroundImage ?? defaultConfig.backgroundImage,
      logoUrl: config.logoUrl ?? defaultConfig.logoUrl,
      tabTitle: config.tabTitle ?? defaultConfig.tabTitle,
      colors: {
        primary: config.colors?.primary ?? defaultConfig.colors.primary,
        secondary: config.colors?.secondary ?? defaultConfig.colors.secondary
      },
      businessInfo: {
        name: config.businessInfo?.name ?? defaultConfig.businessInfo.name,
        subtitle: config.businessInfo?.subtitle ?? defaultConfig.businessInfo.subtitle
      }
    };
  } catch (error) {
    console.error('Error loading login config:', error);
    return defaultConfig;
  }
};