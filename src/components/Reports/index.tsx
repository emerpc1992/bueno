import React, { useState, useEffect } from 'react';
import FinancialSummary from './FinancialSummary';
import { storage } from '../../utils/storage';
import { filterSalesByDate } from '../../utils/filters';
import { calculateFinancialMetrics, type FinancialMetrics } from '../../utils/metrics';
import DateRangeSelector from './DateRangeSelector';
import { generateFinancialReport } from '../../utils/report';
import { Download } from 'lucide-react';
import VendorReports from './VendorReports';

interface ReportsProps {
  userRole?: string;
}

export default function Reports({ userRole = 'admin' }: ReportsProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [metrics, setMetrics] = useState<FinancialMetrics>(() => 
    calculateFinancialMetrics([], [], [], [], startDate, endDate)
  );

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [salesData, productsData, expensesData, creditsData] = await Promise.all([
          storage.sales.load(),
          storage.products.load(),
          storage.expenses.load(),
          storage.credits.load()
        ]);
        
        setSales(salesData || []);
        setProducts(productsData);
        setExpenses(expensesData);
        setCredits(creditsData);
        
        // Update metrics after loading data
        const filtered = filterSalesByDate(salesData, startDate, endDate);
        setFilteredSales(filtered);
        setMetrics(calculateFinancialMetrics(filtered, productsData, expensesData, creditsData, startDate, endDate));
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error loading data');
        setSales([]);
        setProducts([]);
        setExpenses([]);
        setCredits([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Update filtered sales and metrics when dates change
  useEffect(() => {
    if (!startDate || !endDate) {
      console.warn('Invalid date range:', { startDate, endDate });
      return;
    }

    const filtered = filterSalesByDate(sales, startDate, endDate);
    setFilteredSales(filtered);
    setMetrics(calculateFinancialMetrics(filtered, products, expenses, credits, startDate, endDate));
  }, [sales, startDate, endDate, products, expenses, credits]);

  const handleSearch = () => {
    if (!startDate || !endDate) {
      console.warn('Invalid date range for search:', { startDate, endDate });
      return;
    }

    const filtered = filterSalesByDate(sales, startDate, endDate);
    setFilteredSales(filtered);
    setMetrics(calculateFinancialMetrics(filtered, products, expenses, credits, startDate, endDate));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">Error: {error}</div>
    );
  }

  const handleDownloadReport = () => {
    const doc = generateFinancialReport(metrics, startDate, endDate);
    doc.save(`reporte-financiero-${startDate}-${endDate}.pdf`);
  };

  // If user is a vendor, show simplified view
  if (userRole !== 'admin' && userRole !== 'super') {
    return (
      <VendorReports
        metrics={{
          totalSales: metrics.totalSales,
          creditTotal: metrics.creditTotal,
          totalExpenses: metrics.totalExpenses,
          cashPayments: metrics.cashPayments,
          cardPayments: metrics.cardPayments,
          transferPayments: metrics.transferPayments
        }}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearch={() => {
          const filtered = filterSalesByDate(sales, startDate, endDate);
          setFilteredSales(filtered);
          setMetrics(calculateFinancialMetrics(filtered, products, expenses, credits, startDate, endDate));
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">Reportes Financieros</h2>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            title="Descargar reporte PDF"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </button>
        </div>
        <div className="flex-shrink-0">
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSearch={handleSearch}
          />
        </div>
      </div>

      <FinancialSummary {...metrics} />
    </div>
  );
}