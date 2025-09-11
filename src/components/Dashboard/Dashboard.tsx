import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { TrendingUp, TrendingDown, DollarSign, Target, ShoppingCart, Users, Package, Activity, BarChart3, Database, Eye, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatters';

interface DashboardProps {
  onPageChange?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { products, sales, customers } = useData();
  const { settings, translations } = useSettings();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const pieChartInstance = useRef<Chart | null>(null);
  const sparklineRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const sparklineInstances = useRef<{ [key: string]: Chart | null }>({});

  useEffect(() => {
    if (chartRef.current) {
      renderTrendChart();
    }
    if (pieChartRef.current) {
      renderCategoryChart();
    }
    renderSparklines();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
      Object.values(sparklineInstances.current).forEach(instance => {
        if (instance) instance.destroy();
      });
    };
  }, [sales, products]);

  const getTodayStats = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todaysSales = sales.filter(sale => sale.date >= todayStart);
    
    let dailyRevenue = 0;
    let dailyProfit = 0;

    todaysSales.forEach(sale => {
      const saleTotal = Number(sale.finalTotal);
      if (!isNaN(saleTotal) && isFinite(saleTotal)) {
        dailyRevenue += saleTotal;
      }
      
      let saleCost = 0;
      sale.items.forEach((item: any) => {
        const costPrice = Number(item.costPrice);
        const quantity = Number(item.quantity);
        if (!isNaN(costPrice) && !isNaN(quantity) && isFinite(costPrice) && isFinite(quantity)) {
          saleCost += costPrice * quantity;
        }
      });
      
      const subtotal = Number(sale.subtotal);
      const saleDiscount = sale.discount ? Number(sale.discount.amount) : 0;
      
      if (!isNaN(subtotal) && !isNaN(saleDiscount) && isFinite(subtotal) && isFinite(saleDiscount)) {
        const profit = subtotal - saleCost - saleDiscount;
        if (!isNaN(profit) && isFinite(profit)) {
          dailyProfit += profit;
        }
      }
    });

    return {
      dailyRevenue: isNaN(dailyRevenue) ? 0 : dailyRevenue,
      dailyProfit: isNaN(dailyProfit) ? 0 : dailyProfit,
      dailyTransactions: todaysSales.length
    };
  };

  const getMonthlyStats = () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthlySales = sales.filter(sale => sale.date >= monthStart);
    
    let monthlyRevenue = 0;
    monthlySales.forEach(sale => {
      monthlyRevenue += sale.finalTotal;
    });

    return {
      monthlyRevenue,
      monthlyTransactions: monthlySales.length
    };
  };

  const getInventoryValue = () => {
    let totalValue = 0;
    products.forEach(product => {
      totalValue += product.price * product.stock;
    });
    return totalValue;
  };

  const renderTrendChart = () => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Generate last 30 days data
    const days = [];
    const revenueData = [];
    const transactionData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.getDate().toString());
      
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dayStart && saleDate < dayEnd;
      });
      
      const dayRevenue = daySales.reduce((sum, sale) => sum + sale.finalTotal, 0);
      revenueData.push(dayRevenue);
      transactionData.push(daySales.length);
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Revenue (Rp)',
            data: revenueData,
            borderColor: settings.themeColor || '#6366f1',
            backgroundColor: `${settings.themeColor || '#6366f1'}20`,
            pointBackgroundColor: settings.themeColor || '#6366f1',
            fill: true,
            tension: 0.4,
            pointHoverBackgroundColor: settings.themeColor || '#6366f1',
            pointHoverRadius: 8,
            yAxisID: 'y'
          },
          {
            label: 'Transaksi',
            data: transactionData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 8,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(Number(value), settings.currency);
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            grid: {
              drawOnChartArea: false,
            },
          },
          x: {
            grid: {
              display: false,
            }
          }
        }
      }
    };

    chartInstance.current = new Chart(ctx, config);
  };

  const renderCategoryChart = () => {
    if (!pieChartRef.current) return;

    const ctx = pieChartRef.current.getContext('2d');
    if (!ctx) return;

    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
    }

    // Calculate sales by category
    const categoryData: { [key: string]: number } = {};
    
    sales.forEach(sale => {
      sale.items.forEach((item: any) => {
        const category = item.category || 'Lainnya';
        categoryData[category] = (categoryData[category] || 0) + (item.quantity * item.price);
      });
    });

    const categories = Object.keys(categoryData);
    const values = Object.values(categoryData);
    const colors = [
      settings.themeColor || '#6366f1', 
      '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'
    ];

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, categories.length),
          borderWidth: 0,
          cutout: '60%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12
              }
            }
          }
        }
      }
    };

    pieChartInstance.current = new Chart(ctx, config);
  };

  const renderSparklines = () => {
    const sparklineData = generateSparklineData();
    
    Object.entries(sparklineData).forEach(([key, data]) => {
      const canvas = sparklineRefs.current[key];
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      if (sparklineInstances.current[key]) {
        sparklineInstances.current[key]?.destroy();
      }
      
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.values,
            borderColor: key === 'revenue' ? settings.themeColor || '#6366f1' : 
                        key === 'profit' ? '#10b981' : '#f59e0b',
            backgroundColor: key === 'revenue' ? `${settings.themeColor || '#6366f1'}20` : 
                            key === 'profit' ? '#10b98120' : '#f59e0b20',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          scales: {
            x: { display: false },
            y: { display: false }
          },
          elements: {
            point: { radius: 0 }
          }
        }
      };
      
      sparklineInstances.current[key] = new Chart(ctx, config);
    });
  };

  const generateSparklineData = () => {
    const last7Days = [];
    const revenueData = [];
    const profitData = [];
    const transactionData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.getDate().toString());
      
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dayStart && saleDate < dayEnd;
      });
      
      const dayRevenue = daySales.reduce((sum, sale) => sum + sale.finalTotal, 0);
      let dayProfit = 0;
      
      daySales.forEach(sale => {
        let saleCost = 0;
        sale.items.forEach((item: any) => {
          const costPrice = Number(item.costPrice);
          const quantity = Number(item.quantity);
          if (!isNaN(costPrice) && !isNaN(quantity)) {
            saleCost += costPrice * quantity;
          }
        });
        const saleDiscount = sale.discount ? Number(sale.discount.amount) : 0;
        dayProfit += (sale.subtotal - saleCost - saleDiscount);
      });
      
      revenueData.push(dayRevenue);
      profitData.push(dayProfit);
      transactionData.push(daySales.length);
    }
    
    return {
      revenue: { labels: last7Days, values: revenueData },
      profit: { labels: last7Days, values: profitData },
      transactions: { labels: last7Days, values: transactionData }
    };
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getYesterdayStats = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);
    
    const yesterdaysSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= yesterdayStart && saleDate < yesterdayEnd;
    });
    
    let yesterdayRevenue = 0;
    let yesterdayProfit = 0;
    
    yesterdaysSales.forEach(sale => {
      yesterdayRevenue += sale.finalTotal;
      
      let saleCost = 0;
      sale.items.forEach((item: any) => {
        const costPrice = Number(item.costPrice);
        const quantity = Number(item.quantity);
        if (!isNaN(costPrice) && !isNaN(quantity)) {
          saleCost += costPrice * quantity;
        }
      });
      const saleDiscount = sale.discount ? Number(sale.discount.amount) : 0;
      yesterdayProfit += (sale.subtotal - saleCost - saleDiscount);
    });
    
    return {
      yesterdayRevenue,
      yesterdayProfit,
      yesterdayTransactions: yesterdaysSales.length
    };
  };
  const getTopProducts = () => {
    const productSales: { [key: string]: { name: string; category: string; total: number; quantity: number } } = {};
    
    sales.forEach(sale => {
      sale.items.forEach((item: any) => {
        if (!productSales[item.id]) {
          productSales[item.id] = {
            name: item.name,
            category: item.category,
            total: 0,
            quantity: 0
          };
        }
        productSales[item.id].total += item.quantity * item.price;
        productSales[item.id].quantity += item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const getRecentActivity = () => {
    return sales
      .slice(-3)
      .reverse();
  };

  const { dailyRevenue, dailyProfit, dailyTransactions } = getTodayStats();
  const { monthlyRevenue, monthlyTransactions } = getMonthlyStats();
  const inventoryValue = getInventoryValue();
  const { yesterdayRevenue, yesterdayProfit, yesterdayTransactions } = getYesterdayStats();
  const topProducts = getTopProducts();
  const recentActivity = getRecentActivity();

  const revenueChange = calculatePercentageChange(dailyRevenue, yesterdayRevenue);
  const profitChange = calculatePercentageChange(dailyProfit, yesterdayProfit);
  const transactionChange = calculatePercentageChange(dailyTransactions, yesterdayTransactions);

  const handleNavigation = (page: string) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div 
        className="text-white p-6 rounded-2xl dark:shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${settings.themeColor || '#6366f1'} 0%, ${settings.themeColor || '#6366f1'}CC 100%)`
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">{translations.welcome}</h1>
            <p className="text-white/80">
              {settings.language === 'en' ? 'Monitor your business performance today - ' : 'Pantau performa bisnis Anda hari ini - '}
              {new Date().toLocaleDateString(settings.language === 'en' ? 'en-US' : 'id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatCurrency(dailyRevenue, settings.currency)}</div>
            <div className="text-white/70 text-sm">{translations.todayRevenue}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
          style={{ borderLeftColor: settings.themeColor || '#6366f1' }}
          onClick={() => handleNavigation('reports-page')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">{translations.todayRevenue}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(dailyRevenue, settings.currency)}</p>
              <p className={`text-xs flex items-center mt-1 ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <i className={`lni ${revenueChange >= 0 ? 'lni-arrow-up' : 'lni-arrow-down'} text-xs mr-1`}></i>
                {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% {settings.language === 'en' ? 'vs yesterday' : 'vs kemarin'}
              </p>
            </div>
            <div 
              className="p-3 rounded-full"
              style={{ 
                backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                color: settings.themeColor || '#6366f1'
              }}
            >
              <i className="lni lni-dollar text-2xl"></i>
            </div>
          </div>
          <div className="h-12 -mb-2">
            <canvas 
              ref={(el) => sparklineRefs.current['revenue'] = el}
              className="w-full h-full"
            ></canvas>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
          style={{ borderLeftColor: '#10b981' }}
          onClick={() => handleNavigation('reports-page')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">{translations.todayProfit}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(dailyProfit, settings.currency)}</p>
              <p className={`text-xs flex items-center mt-1 ${profitChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <i className={`lni ${profitChange >= 0 ? 'lni-arrow-up' : 'lni-arrow-down'} text-xs mr-1`}></i>
                {profitChange >= 0 ? '+' : ''}{profitChange.toFixed(1)}% {settings.language === 'en' ? 'vs yesterday' : 'vs kemarin'}
              </p>
            </div>
            <div 
              className="p-3 rounded-full flex-shrink-0"
              style={{ 
                backgroundColor: '#10b98120',
                color: '#10b981'
              }}
            >
              <i className="lni lni-stats-up text-2xl"></i>
            </div>
          </div>
          <div className="h-12 -mb-2">
            <canvas 
              ref={(el) => sparklineRefs.current['profit'] = el}
              className="w-full h-full"
            ></canvas>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
          style={{ borderLeftColor: '#f59e0b' }}
          onClick={() => handleNavigation('reports-page')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">{translations.todayTransactions}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dailyTransactions}</p>
              <p className={`text-xs flex items-center mt-1 ${transactionChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <i className={`lni ${transactionChange >= 0 ? 'lni-arrow-up' : 'lni-arrow-down'} text-xs mr-1`}></i>
                {transactionChange >= 0 ? '+' : ''}{transactionChange.toFixed(1)}% {settings.language === 'en' ? 'vs yesterday' : 'vs kemarin'}
              </p>
            </div>
            <div 
              className="p-3 rounded-full flex-shrink-0"
              style={{ 
                backgroundColor: '#f59e0b20',
                color: '#f59e0b'
              }}
            >
              <i className="lni lni-cart text-2xl"></i>
            </div>
          </div>
          <div className="h-12 -mb-2">
            <canvas 
              ref={(el) => sparklineRefs.current['transactions'] = el}
              className="w-full h-full"
            ></canvas>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow"
          style={{ borderLeftColor: settings.themeColor || '#6366f1' }}
          onClick={() => handleNavigation('inventory-page')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{translations.stockValue}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(inventoryValue, settings.currency)}</p>
              <p className="text-xs text-gray-500">{products.length} {settings.language === 'en' ? 'products' : 'produk'}</p>
            </div>
            <div 
              className="p-3 rounded-full"
              style={{ 
                backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                color: settings.themeColor || '#6366f1'
              }}
            >
              <i className="lni lni-package text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <i className="lni lni-stats-up text-xl mr-2" style={{ color: settings.themeColor || '#6366f1' }}></i>
              {settings.language === 'en' ? 'Sales Trend (30 Days)' : 'Trend Penjualan (30 Hari)'}
            </h3>
            <button 
              onClick={() => handleNavigation('reports-page')}
              className="text-sm font-medium flex items-center hover:opacity-80"
              style={{ color: settings.themeColor || '#6366f1' }}
            >
              {settings.language === 'en' ? 'View Details' : 'Lihat Detail'} <i className="lni lni-arrow-right text-sm ml-1"></i>
            </button>
          </div>
          <div className="h-64">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <i className="lni lni-pie-chart text-xl mr-2" style={{ color: settings.themeColor || '#6366f1' }}></i>
              {settings.language === 'en' ? 'Sales by Category' : 'Penjualan per Kategori'}
            </h3>
            <button 
              onClick={() => handleNavigation('reports-page')}
              className="text-sm font-medium flex items-center hover:opacity-80"
              style={{ color: settings.themeColor || '#6366f1' }}
            >
              {settings.language === 'en' ? 'View Details' : 'Lihat Detail'} <i className="lni lni-arrow-right text-sm ml-1"></i>
            </button>
          </div>
          <div className="h-64">
            <canvas ref={pieChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Quick Actions & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="lni lni-bolt text-xl mr-2" style={{ color: settings.themeColor || '#6366f1' }}></i>
            {settings.language === 'en' ? 'Quick Actions' : 'Aksi Cepat'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer transition-colors"
              style={{ 
                ':hover': { borderColor: settings.themeColor || '#6366f1' }
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = settings.themeColor || '#6366f1'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              onClick={() => handleNavigation('reports-page')}
            >
              <div className="flex items-center">
                <div 
                  className="p-2 rounded-lg mr-3"
                  style={{ 
                    backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                    color: settings.themeColor || '#6366f1'
                  }}
                >
                  <i className="lni lni-bar-chart text-lg"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{settings.language === 'en' ? 'View All Reports' : 'Lihat Semua Laporan'}</h4>
                  <p className="text-sm text-gray-500">{settings.language === 'en' ? 'Complete sales and profit analysis' : 'Analisis lengkap penjualan dan profit'}</p>
                  <p className="text-xs mt-1" style={{ color: settings.themeColor || '#6366f1' }}>{sales.length} transaksi</p>
                </div>
              </div>
              <i className="lni lni-arrow-right text-gray-400 ml-auto"></i>
            </div>

            <div 
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.borderColor = settings.themeColor || '#6366f1'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              onClick={() => handleNavigation('inventory-page')}
            >
              <div className="flex items-center">
                <div 
                  className="p-2 rounded-lg mr-3"
                  style={{ 
                    backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                    color: settings.themeColor || '#6366f1'
                  }}
                >
                  <i className="lni lni-package text-lg"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{settings.language === 'en' ? 'Manage Inventory' : 'Kelola Inventori'}</h4>
                  <p className="text-sm text-gray-500">{settings.language === 'en' ? 'Monitor stock and add products' : 'Monitor stok dan tambah produk'}</p>
                  <p className="text-xs mt-1" style={{ color: settings.themeColor || '#6366f1' }}>{products.length} produk</p>
                </div>
              </div>
              <i className="lni lni-arrow-right text-gray-400 ml-auto"></i>
            </div>

            <div 
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.borderColor = settings.themeColor || '#6366f1'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              onClick={() => handleNavigation('customer-page')}
            >
              <div className="flex items-center">
                <div 
                  className="p-2 rounded-lg mr-3"
                  style={{ 
                    backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                    color: settings.themeColor || '#6366f1'
                  }}
                >
                  <i className="lni lni-users text-lg"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{settings.language === 'en' ? 'Customer Database' : 'Database Pelanggan'}</h4>
                  <p className="text-sm text-gray-500">{settings.language === 'en' ? 'View history and customer data' : 'Lihat riwayat dan data pelanggan'}</p>
                  <p className="text-xs mt-1" style={{ color: settings.themeColor || '#6366f1' }}>{customers.length} pelanggan</p>
                </div>
              </div>
              <i className="lni lni-arrow-right text-gray-400 ml-auto"></i>
            </div>

            <div 
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.borderColor = settings.themeColor || '#6366f1'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              onClick={() => handleNavigation('pos-page')}
            >
              <div className="flex items-center">
                <div 
                  className="p-2 rounded-lg mr-3"
                  style={{ 
                    backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                    color: settings.themeColor || '#6366f1'
                  }}
                >
                  <i className="lni lni-cart text-lg"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{settings.language === 'en' ? 'Start Transaction' : 'Mulai Transaksi'}</h4>
                  <p className="text-sm text-gray-500">{settings.language === 'en' ? 'Open cashier to serve customers' : 'Buka kasir untuk melayani pelanggan'}</p>
                  <p className="text-xs mt-1" style={{ color: settings.themeColor || '#6366f1' }}>{settings.language === 'en' ? 'Cashier ready' : 'Kasir siap'}</p>
                </div>
              </div>
              <i className="lni lni-arrow-right text-gray-400 ml-auto"></i>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <i className="lni lni-crown text-xl mr-2" style={{ color: settings.themeColor || '#6366f1' }}></i>
              {settings.language === 'en' ? 'Top Products This Month' : 'Top Produk Bulan Ini'}
            </h3>
            <button 
              onClick={() => handleNavigation('inventory-page')}
              className="text-sm font-medium flex items-center hover:opacity-80"
              style={{ color: settings.themeColor || '#6366f1' }}
            >
              {settings.language === 'en' ? 'View All' : 'Lihat Semua'} <i className="lni lni-arrow-right text-sm ml-1"></i>
            </button>
          </div>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: settings.themeColor || '#6366f1' }}>{formatCurrency(product.total, settings.currency)}</p>
                    <p className="text-xs text-gray-500">{product.quantity} {settings.language === 'en' ? 'sold' : 'terjual'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">{settings.language === 'en' ? 'No product sales data yet' : 'Belum ada data penjualan produk'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Status */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="lni lni-stats-up text-xl mr-2" style={{ color: settings.themeColor || '#6366f1' }}></i>
            {settings.language === 'en' ? 'Business Status' : 'Status Bisnis'}
          </h3>
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors dark:hover:bg-gray-700"
              style={{ backgroundColor: `${settings.themeColor || '#6366f1'}10` }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${settings.themeColor || '#6366f1'}20`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${settings.themeColor || '#6366f1'}10`}
              onClick={() => handleNavigation('inventory-page')}
            >
              <div className="flex items-center">
                <div 
                  className="p-2 rounded-lg mr-3"
                  style={{ 
                    backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                    color: settings.themeColor || '#6366f1'
                  }}
                >
                  <i className="lni lni-package text-lg"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{translations.inventory}</h4>
                  <p className="text-sm text-gray-500">{products.length} {settings.language === 'en' ? 'total products' : 'produk total'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ✓ {settings.language === 'en' ? 'Stock safe' : 'Stok aman'}
                </span>
                <i className="lni lni-arrow-right text-gray-400 ml-2"></i>
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors dark:hover:bg-gray-700"
              style={{ backgroundColor: `${settings.themeColor || '#6366f1'}10` }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${settings.themeColor || '#6366f1'}20`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${settings.themeColor || '#6366f1'}10`}
              onClick={() => handleNavigation('customer-page')}
            >
              <div className="flex items-center">
                <div 
                  className="p-2 rounded-lg mr-3"
                  style={{ 
                    backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                    color: settings.themeColor || '#6366f1'
                  }}
                >
                  <i className="lni lni-users text-lg"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{translations.customers}</h4>
                  <p className="text-sm text-gray-500">{customers.length} {settings.language === 'en' ? `active of ${customers.length} total` : `aktif dari ${customers.length} total`}</p>
                </div>
              </div>
              <i className="lni lni-arrow-right text-gray-400"></i>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg mr-3">
                  <i className="lni lni-reload text-lg text-orange-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{settings.language === 'en' ? 'Returns' : 'Return'}</h4>
                  <p className="text-sm text-gray-500">0 {settings.language === 'en' ? 'returns' : 'return'} - {formatCurrency(0, settings.currency)}</p>
                </div>
              </div>
              <i className="lni lni-arrow-right text-gray-400"></i>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <i className="lni lni-pulse text-xl mr-2" style={{ color: settings.themeColor || '#6366f1' }}></i>
              {settings.language === 'en' ? 'Recent Activity' : 'Aktivitas Terkini'}
            </h3>
            <button 
              onClick={() => handleNavigation('reports-page')}
              className="text-sm font-medium flex items-center hover:opacity-80"
              style={{ color: settings.themeColor || '#6366f1' }}
            >
              {settings.language === 'en' ? 'View All Activities' : 'Lihat Semua Aktivitas'} <i className="lni lni-arrow-right text-sm ml-1"></i>
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((sale, index) => (
                <div 
                  key={sale.id} 
                  className="flex items-center p-3 rounded-lg dark:bg-gray-700"
                  style={{ backgroundColor: `${settings.themeColor || '#6366f1'}10` }}
                >
                  <div 
                    className="p-2 rounded-lg mr-3"
                    style={{ 
                      backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                      color: settings.themeColor || '#6366f1'
                    }}
                  >
                    <i className="lni lni-cart text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {settings.language === 'en' ? 'Sale' : 'Penjualan'} #{sale.id.substring(0, 8)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(sale.finalTotal, settings.currency)} - {sale.customer ? sale.customer.name : (settings.language === 'en' ? 'Guest' : 'Tamu')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(sale.date).toLocaleString(settings.language === 'en' ? 'en-US' : 'id-ID')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">{settings.language === 'en' ? 'No recent activities' : 'Belum ada aktivitas terbaru'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Performance Summary */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <i className="lni lni-bar-chart text-xl mr-2" style={{ color: settings.themeColor || '#6366f1' }}></i>
            {settings.language === 'en' ? 'This Week\'s Performance Summary' : 'Ringkasan Performa Minggu Ini'}
          </h3>
          <button 
            onClick={() => handleNavigation('reports-page')}
            className="text-sm font-medium flex items-center hover:opacity-80"
            style={{ color: settings.themeColor || '#6366f1' }}
          >
            {settings.language === 'en' ? 'View Full Report' : 'Lihat Laporan Lengkap'} <i className="lni lni-arrow-right text-sm ml-1"></i>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div 
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: `${settings.themeColor || '#6366f1'}10` }}
          >
            <div 
              className="p-2 rounded-lg inline-flex mb-2"
              style={{ 
                backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                color: settings.themeColor || '#6366f1'
              }}
            >
              <i className="lni lni-dollar text-lg"></i>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">{settings.language === 'en' ? 'This Week\'s Revenue' : 'Revenue Minggu Ini'}</h4>
            <p className="text-2xl font-bold" style={{ color: settings.themeColor || '#6366f1' }}>{formatCurrency(monthlyRevenue, settings.currency)}</p>
          </div>
          
          <div 
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: `${settings.themeColor || '#6366f1'}10` }}
          >
            <div 
              className="p-2 rounded-lg inline-flex mb-2"
              style={{ 
                backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                color: settings.themeColor || '#6366f1'
              }}
            >
              <i className="lni lni-cart text-lg"></i>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">{settings.language === 'en' ? 'This Week\'s Transactions' : 'Transaksi Minggu Ini'}</h4>
            <p className="text-2xl font-bold" style={{ color: settings.themeColor || '#6366f1' }}>{monthlyTransactions}</p>
          </div>
          
          <div 
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: `${settings.themeColor || '#6366f1'}10` }}
          >
            <div 
              className="p-2 rounded-lg inline-flex mb-2"
              style={{ 
                backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                color: settings.themeColor || '#6366f1'
              }}
            >
              <i className="lni lni-users text-lg"></i>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">{settings.language === 'en' ? 'New Customers' : 'Pelanggan Baru'}</h4>
            <p className="text-2xl font-bold" style={{ color: settings.themeColor || '#6366f1' }}>0</p>
          </div>
          
          <div 
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: `${settings.themeColor || '#6366f1'}10` }}
          >
            <div 
              className="p-2 rounded-lg inline-flex mb-2"
              style={{ 
                backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                color: settings.themeColor || '#6366f1'
              }}
            >
              <i className="lni lni-package text-lg"></i>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">{settings.language === 'en' ? 'Products Sold' : 'Produk Terjual'}</h4>
            <p className="text-2xl font-bold" style={{ color: settings.themeColor || '#6366f1' }}>
              {sales.reduce((total, sale) => total + sale.items.reduce((sum: number, item: any) => sum + item.quantity, 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;