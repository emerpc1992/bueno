export interface ReceiptConfig {
  paperSize: {
    width: number;  // in mm
    height: number; // in mm
  };
  fontSize: {
    title: number;
    subtitle: number;
    body: number;
  };
  businessInfo: {
    name: string;
    subtitle: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

// Default configuration
export const defaultConfig: ReceiptConfig = {
  paperSize: {
    width: 70,  // 70mm standard receipt width
    height: 200 // Dynamic height
  },
  fontSize: {
    title: 10,
    subtitle: 8,
    body: 7
  },
  businessInfo: {
    name: 'Alvaro Rugama',
    subtitle: 'Make Up Studio & Beauty Salon'
  }
};

// Save configuration to localStorage
export const saveReceiptConfig = (config: ReceiptConfig) => {
  localStorage.setItem('receiptConfig', JSON.stringify(config));
};

// Load configuration from localStorage
export const loadReceiptConfig = (): ReceiptConfig => {
  const saved = localStorage.getItem('receiptConfig');
  return saved ? JSON.parse(saved) : defaultConfig;
};