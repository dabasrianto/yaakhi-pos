import React, { useState, useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js/auto';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/formatters';
import TransactionHistory from './TransactionHistory';

// Register Chart.js components
Chart.register(...registerables);

const ReportsPage: React.FC = () => {
  const { sales } = useData();
  const [filter, setFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filteredSales, setFilteredSales] = useState(sales);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    filterSales();
  }, [sales, filter, customStartDate, customEndDate]);

  useEffect(() => {
    if (chartRef.current) {
      renderSalesChart();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [filteredSales]);

  const filterSales = () => {
    if (filter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      setFilteredSales(sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= start && saleDate <= end;
      }));
    } else {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      switch (filter) {
        case 'today':
          setFilteredSales(sales.filter(sale => new Date(sale.date) >= today));
          break;
        case 'week':
          setFilteredSales(sales.filter(sale => new Date(sale.date) >= startOfWeek));
          break;
        case 'month':
          setFilteredSales(sales.filter(sale => new Date(sale.date) >= startOfMonth));
          break;
        default:
          setFilteredSales(sales);
          break;
      }
    }
  };

  const renderSalesChart = () => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Generate chart data based on filter
    const chartData = generateChartData();
    
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Revenue',
          data: chartData.data,
          backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(99, 102, 241, 0.1)';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
            return gradient;
          },
          borderColor: '#6366f1',
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#6366f1',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
          tension: 0.4,
          fill: true,
        }]
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
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#4338ca',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderWidth: 0,
            cornerRadius: 12,
            displayColors: false,
            padding: 12,
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                const value = context.parsed.y;
                return formatCurrency(value);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(...chartData.data, 1000000) * 1.2,
            grid: {
              color: '#F3F4F6',
              drawBorder: false,
              lineWidth: 1,
              drawTicks: false,
              borderDash: [5, 5],
            },
            ticks: {
              callback: function(value) {
                const numValue = Number(value);
                if (numValue === 0) return '0';
                if (numValue >= 1000000) {
                  return `${(numValue / 1000000).toFixed(1)}M`;
                } else if (numValue >= 1000) {
                  return `${(numValue / 1000).toFixed(0)}K`;
                } else {
                  return numValue.toString();
                }
              },
              color: '#9CA3AF',
              font: {
                size: 12,
                weight: '500'
              },
              padding: 10,
              maxTicksLimit: 8,
            }
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#9CA3AF',
              font: {
                size: 12,
                weight: '500'
              },
              padding: 10,
              maxTicksLimit: 10,
            }
          }
        },
        elements: {
          point: {
            hoverRadius: 8,
          }
        }
      }
    };

    try {
      chartInstance.current = new Chart(ctx, config);
      console.log('Chart created successfully with data:', chartData);
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  };

  const generateChartData = () => {
    let labels: string[] = [];
    let data: number[] = [];
    if (filter === 'today') {
      // Hourly data for today
      const today = new Date();
      for (let i = 0; i < 24; i++) {
        labels.push(`${i.toString().padStart(2, '0')}:00`);
        const hourStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), i);
        const hourEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), i + 1);
        const hourlySales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= hourStart && saleDate < hourEnd;
        });
        data.push(hourlySales.reduce((sum, sale) => sum + sale.finalTotal, 0));
      }
    } else if (filter === 'week') {
      // Daily data for the week
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        labels.push(days[date.getDay()]);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        const dailySales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= dayStart && saleDate < dayEnd;
        });
        data.push(dailySales.reduce((sum, sale) => sum + sale.finalTotal, 0));
      }
    } else if (filter === 'month') {
      // Daily data for the month
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
        const dateStr = d.getDate().toString();
        labels.push(dateStr);
        
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
        const dailySales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= dayStart && saleDate < dayEnd;
        });
        data.push(dailySales.reduce((sum, sale) => sum + sale.finalTotal, 0));
      }
    } else if (filter === 'custom' && customStartDate && customEndDate) {
      // Daily data for custom range
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 31) {
        // Show daily data for ranges <= 31 days
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          labels.push(d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));
          
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
          const dailySales = filteredSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= dayStart && saleDate < dayEnd;
          });
          data.push(dailySales.reduce((sum, sale) => sum + sale.finalTotal, 0));
        }
      } else {
        // Show monthly data for longer ranges
        const monthlyData: { [key: string]: number } = {};
        filteredSales.forEach(sale => {
          const saleDate = new Date(sale.date);
          const monthYearKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[monthYearKey]) {
            monthlyData[monthYearKey] = 0;
          }
          monthlyData[monthYearKey] += sale.finalTotal;
        });
        
        const sortedKeys = Object.keys(monthlyData).sort();
        labels = sortedKeys.map(key => {
          const [year, month] = key.split('-');
          return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        });
        data = sortedKeys.map(key => monthlyData[key]);
      }
    } else {
      // All time - show monthly data
      const monthlyData: { [key: string]: number } = {};
      filteredSales.forEach(sale => {
        const saleDate = new Date(sale.date);
        const monthYearKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthYearKey]) {
          monthlyData[monthYearKey] = 0;
        }
        monthlyData[monthYearKey] += sale.finalTotal;
      });
      
      const sortedKeys = Object.keys(monthlyData).sort();
      labels = sortedKeys.map(key => {
        const [year, month] = key.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      });
      data = sortedKeys.map(key => monthlyData[key]);
    }

     console.log('Generated chart data:', { labels, data, filter });
     return { labels, data };
  };

  // Debug: Log chart data
  useEffect(() => {
    console.log('Chart Debug:', {
      filteredSales: filteredSales.length,
      filter,
      chartRef: !!chartRef.current
    });
  }, [filteredSales, filter]);

  const calculateTotals = () => {
    let totalRevenue = 0;
    let totalProfit = 0;
    
    filteredSales.forEach(sale => {
      const saleTotal = Number(sale.finalTotal);
      if (!isNaN(saleTotal) && isFinite(saleTotal)) {
        totalRevenue += saleTotal;
      }
      
      let saleTotalCost = 0;
      
      sale.items.forEach((item: any) => {
        const costPrice = Number(item.costPrice);
        const quantity = Number(item.quantity);
        
        if (!isNaN(costPrice) && !isNaN(quantity) && isFinite(costPrice) && isFinite(quantity)) {
          saleTotalCost += costPrice * quantity;
        }
      });

      const subtotal = Number(sale.subtotal);
      const discountAmount = sale.discount ? Number(sale.discount.amount) : 0;
      
      if (!isNaN(subtotal) && isFinite(subtotal) && 
          !isNaN(discountAmount) && isFinite(discountAmount)) {
        const saleProfit = subtotal - saleTotalCost - discountAmount;
        if (!isNaN(saleProfit) && isFinite(saleProfit)) {
          totalProfit += saleProfit;
        }
      }
    });

    return {
      totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
      totalProfit: isNaN(totalProfit) ? 0 : totalProfit,
      totalTransactions: filteredSales.length
    };
  };

  const exportSalesToCSV = () => {
    if (filteredSales.length === 0) {
      alert('Tidak ada data untuk diekspor pada periode ini.');
      return;
    }

    let csvContent = "ID Transaksi,Tanggal,Pelanggan,Metode Bayar,Subtotal,Diskon (Tipe),Diskon (Nilai),Diskon (Jumlah),Total Akhir,Nama Produk,Merek,Kategori,Harga Modal,Harga Jual,Jumlah,Total Item\n";

    filteredSales.forEach(sale => {
      sale.items.forEach((item: any) => {
        const row = [
          sale.id,
          new Date(sale.date).toLocaleString('id-ID'),
          `"${sale.customer ? sale.customer.name.replace(/"/g, '""') : 'Tamu'}"`,
          sale.paymentMethod,
          sale.subtotal,
          sale.discount.type,
          sale.discount.value,
          sale.discount.amount,
          sale.finalTotal,
          `"${item.name.replace(/"/g, '""')}"`,
          `"${(item.brand || '').replace(/"/g, '""')}"`,
          `"${item.category.replace(/"/g, '""')}"`,
          item.costPrice,
          item.price,
          item.quantity,
          item.price * item.quantity
        ].join(",");
        csvContent += row + "\n";
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", 'laporan_transaksi.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { totalRevenue, totalProfit, totalTransactions } = calculateTotals();

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <i className="fas fa-chart-line mr-2"></i>Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <i className="fas fa-history mr-2"></i>Riwayat Transaksi
          </button>
        </nav>
      </div>

      {activeTab === 'overview' ? (
        <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-500 text-xs lg:text-sm">Total Pemasukan</h3>
            <p className="text-lg lg:text-2xl font-bold text-slate-800">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        
        <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-500 text-xs lg:text-sm">Total Keuntungan</h3>
            <p className="text-lg lg:text-2xl font-bold text-slate-800">{formatCurrency(totalProfit)}</p>
          </div>
        </div>
        
        <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-500 text-xs lg:text-sm">Total Transaksi</h3>
            <p className="text-lg lg:text-2xl font-bold text-slate-800">{totalTransactions}</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm mb-4 lg:mb-6">
        <h2 className="text-base lg:text-lg font-semibold text-slate-700 mb-3 lg:mb-4">Filter Laporan</h2>
        <div className="w-full space-y-4">
          <div className="flex items-center gap-1 lg:gap-2 flex-wrap">
            {['today', 'week', 'month', 'all'].map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-2 lg:px-3 py-1 text-xs lg:text-sm rounded-full border border-slate-300 ${
                  filter === filterType ? 'bg-indigo-500 text-white border-indigo-500' : ''
                }`}
              >
                {filterType === 'today' && 'Hari Ini'}
                {filterType === 'week' && 'Minggu Ini'}
                {filterType === 'month' && 'Bulan Ini'}
                {filterType === 'all' && 'Semua'}
              </button>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row items-end gap-2">
            <div className="flex-grow w-full">
              <label htmlFor="start-date" className="text-xs text-slate-500 block">Dari Tanggal</label>
              <input
                type="date"
                id="start-date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full text-xs lg:text-sm p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-grow w-full">
              <label htmlFor="end-date" className="text-xs text-slate-500 block">Sampai Tanggal</label>
              <input
                type="date"
                id="end-date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full text-xs lg:text-sm p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setFilter('custom')}
              className="w-full sm:w-auto px-3 lg:px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs lg:text-sm rounded-lg font-semibold"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-4 lg:p-8 rounded-xl lg:rounded-3xl shadow-sm mb-4 lg:mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-3">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Revenue Analytics</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-sm font-medium text-gray-600">Revenue</span>
            </div>
            <select className="text-xs lg:text-sm border border-gray-300 rounded-lg px-3 lg:px-4 py-2 bg-white font-medium">
              <option>Analytics</option>
            </select>
          </div>
        </div>
        <div className="h-64 lg:h-96">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-700">Riwayat Transaksi</h2>
          <button
            onClick={exportSalesToCSV}
            className="text-sm bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-lg hover:bg-green-200"
          >
            <i className="fas fa-file-excel mr-2"></i>Ekspor
            <span className="ml-1 text-xs">(Ringkasan)</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">ID Transaksi</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Tanggal</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Pelanggan</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Items</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Subtotal</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Diskon</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Total</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Metode Bayar</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    Tidak ada transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredSales
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(sale => (
                    <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-sm text-slate-600">
                        #{sale.id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>
                          <p className="font-medium">{new Date(sale.date).toLocaleDateString('id-ID')}</p>
                          <p className="text-xs text-slate-500">{new Date(sale.date).toLocaleTimeString('id-ID')}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {sale.customer ? sale.customer.name : 'Tamu'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{sale.items.length}</span>
                          <span className="text-slate-500 text-sm">item</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatCurrency(sale.subtotal)}
                      </td>
                      <td className="py-3 px-4">
                        {sale.discount && sale.discount.amount > 0 ? (
                          <span className="text-red-600 font-medium">
                            -{formatCurrency(sale.discount.amount)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-green-600">
                        {formatCurrency(sale.finalTotal)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sale.paymentMethod === 'Tunai' ? 'bg-green-100 text-green-800' :
                          sale.paymentMethod === 'Transfer Bank' ? 'bg-blue-100 text-blue-800' :
                          sale.paymentMethod === 'E-Wallet' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {sale.paymentMethod || 'Tunai'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <i className="fas fa-eye text-sm"></i>
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
            {filteredSales.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="py-4 px-4 font-bold text-slate-800 text-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      TOTAL RINGKASAN
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800 text-lg">
                    {formatCurrency(filteredSales.reduce((sum, sale) => sum + sale.subtotal, 0))}
                  </td>
                  <td className="py-4 px-4 font-bold text-red-600 text-lg">
                    -{formatCurrency(filteredSales.reduce((sum, sale) => sum + (sale.discount?.amount || 0), 0))}
                  </td>
                  <td className="py-4 px-4 font-bold text-green-600 text-lg">
                    {formatCurrency(totalRevenue)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">Total Transaksi</span>
                      <span className="font-bold text-indigo-600 text-lg">{totalTransactions}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">Keuntungan</span>
                      <span className="font-bold text-blue-600 text-lg">{formatCurrency(totalProfit)}</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <div>
          {filteredSales.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Tidak ada transaksi pada periode ini.</p>
          ) : (
            filteredSales
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(sale => (
                <details key={sale.id} className="py-3 border-b border-slate-200 group">
                  <summary className="flex justify-between items-center cursor-pointer font-semibold text-slate-700">
                    <div className="flex-grow">
                      <span>Transaksi #{sale.id}</span>
                      <span className="block text-xs text-slate-500 font-normal">
                        {new Date(sale.date).toLocaleString('id-ID')}
                      </span>
                      {sale.customer && (
                        <div className="text-xs text-slate-500">Pelanggan: {sale.customer.name}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-bold">{formatCurrency(sale.finalTotal)}</span>
                      {sale.discount && sale.discount.amount > 0 && (
                        <div className="text-xs text-red-600">Diskon: -{formatCurrency(sale.discount.amount)}</div>
                      )}
                      <span className={`mt-1 block text-xs px-2 py-0.5 rounded-full font-medium ${
                        sale.paymentMethod === 'Tunai' ? 'bg-green-100 text-green-800' :
                        sale.paymentMethod === 'Transfer Bank' ? 'bg-blue-100 text-blue-800' :
                        sale.paymentMethod === 'E-Wallet' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {sale.paymentMethod || 'Tunai'}
                      </span>
                    </div>
                    <i className="fas fa-chevron-down ml-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div className="mt-2 pl-4 border-l-2 border-indigo-200">
                    <div className="flex justify-between text-sm py-1 text-slate-500">
                      <span>Subtotal</span>
                      <span>{formatCurrency(sale.subtotal)}</span>
                    </div>
                    {sale.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm py-1 text-slate-600 pl-2">
                        <span>
                          {item.name} <span className="text-slate-500">(x{item.quantity})</span>
                        </span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              ))
          )}
        </div>
      </div>
        </>
      ) : (
        <TransactionHistory filteredSales={filteredSales} />
      )}
    </div>
  );
};

export default ReportsPage;