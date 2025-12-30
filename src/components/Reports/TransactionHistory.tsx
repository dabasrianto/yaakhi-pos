import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/formatters';
import TransactionModal from './TransactionModal';

interface TransactionHistoryProps {
  filteredSales: any[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ filteredSales }) => {
  const { customers } = useData();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort transactions
  const processedTransactions = useMemo(() => {
    let filtered = [...filteredSales];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer && sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        sale.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(sale => sale.paymentMethod === paymentFilter);
    }

    // Status filter (based on amount)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => {
        if (statusFilter === 'high') return sale.finalTotal >= 100000;
        if (statusFilter === 'medium') return sale.finalTotal >= 50000 && sale.finalTotal < 100000;
        if (statusFilter === 'low') return sale.finalTotal < 50000;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.finalTotal;
          bValue = b.finalTotal;
          break;
        case 'customer':
          aValue = a.customer ? a.customer.name : 'Tamu';
          bValue = b.customer ? b.customer.name : 'Tamu';
          break;
        case 'payment':
          aValue = a.paymentMethod;
          bValue = b.paymentMethod;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [filteredSales, searchTerm, statusFilter, paymentFilter, sortBy, sortOrder]);

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setModalMode('view');
  };

  const handleEditTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setModalMode('edit');
  };

  const getStatusBadge = (amount: number) => {
    if (amount >= 100000) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">High Value</span>;
    } else if (amount >= 50000) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Medium Value</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Low Value</span>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      'Tunai': 'bg-green-100 text-green-800',
      'Transfer Bank': 'bg-blue-100 text-blue-800',
      'E-Wallet': 'bg-purple-100 text-purple-800',
      'Saldo': 'bg-amber-100 text-amber-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {method}
      </span>
    );
  };

  const exportTransactions = () => {
    if (processedTransactions.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    let csvContent = "ID,Tanggal,Waktu,Pelanggan,Metode Bayar,Items,Subtotal,Diskon,Pajak,Total,Status\n";
    
    processedTransactions.forEach(sale => {
      const row = [
        sale.id,
        new Date(sale.date).toLocaleDateString('id-ID'),
        new Date(sale.date).toLocaleTimeString('id-ID'),
        `"${sale.customer ? sale.customer.name.replace(/"/g, '""') : 'Tamu'}"`,
        sale.paymentMethod,
        sale.items.length,
        sale.subtotal,
        sale.discount?.amount || 0,
        sale.tax?.amount || 0,
        sale.finalTotal,
        sale.finalTotal >= 100000 ? 'High Value' : sale.finalTotal >= 50000 ? 'Medium Value' : 'Low Value'
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `riwayat_transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Riwayat Transaksi</h2>
            <p className="text-sm text-slate-500">{processedTransactions.length} dari {filteredSales.length} transaksi</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportTransactions}
              className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
            >
              <i className="fas fa-file-excel mr-2"></i>Ekspor CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Pembayaran</option>
              <option value="Tunai">Tunai</option>
              <option value="Transfer Bank">Transfer Bank</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Saldo">Saldo</option>
            </select>
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Status</option>
              <option value="high">High Value (≥100K)</option>
              <option value="medium">Medium Value (50K-100K)</option>
              <option value="low">Low Value (&lt;50K)</option>
            </select>
          </div>
          
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date">Urutkan: Tanggal</option>
              <option value="amount">Urutkan: Jumlah</option>
              <option value="customer">Urutkan: Pelanggan</option>
              <option value="payment">Urutkan: Pembayaran</option>
            </select>
          </div>
          
          <div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">
                <input type="checkbox" className="rounded border-slate-300" />
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Tanggal & Waktu</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Pelanggan</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Items</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Pembayaran</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Total</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {processedTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <i className="fas fa-receipt text-3xl text-slate-300"></i>
                    <p>Tidak ada transaksi ditemukan</p>
                    <p className="text-sm">Coba ubah filter pencarian</p>
                  </div>
                </td>
              </tr>
            ) : (
              processedTransactions.map((sale, index) => (
                <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {new Date(sale.date).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(sale.date).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {sale.customer ? sale.customer.name.charAt(0).toUpperCase() : 'T'}
                      </div>
                      <span className="font-medium text-slate-800 text-sm">
                        {sale.customer ? sale.customer.name : 'Tamu'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-slate-800">{sale.items.length}</span>
                      <span className="text-slate-500 text-sm">item</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getPaymentMethodBadge(sale.paymentMethod)}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-bold text-slate-800">{formatCurrency(sale.finalTotal)}</p>
                      {sale.discount && sale.discount.amount > 0 && (
                        <p className="text-xs text-red-600">
                          Diskon: -{formatCurrency(sale.discount.amount)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(sale.finalTotal)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewTransaction(sale)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <i className="fas fa-eye text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleEditTransaction(sale)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Transaksi"
                      >
                        <i className="fas fa-edit text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {processedTransactions.length > 0 && (
            <tfoot className="bg-slate-50 border-t-2 border-slate-300">
              <tr>
                <td colSpan={3} className="py-4 px-4 font-bold text-slate-800 text-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    TOTAL RINGKASAN
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Total Items</span>
                    <span className="font-bold text-slate-800 text-lg">
                      {processedTransactions.reduce((sum, sale) => sum + sale.items.length, 0)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Metode Terpopuler</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {(() => {
                        const paymentCounts = processedTransactions.reduce((acc, sale) => {
                          acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        const mostPopular = Object.entries(paymentCounts).sort(([,a], [,b]) => b - a)[0];
                        return mostPopular ? `${mostPopular[0]} (${mostPopular[1]}x)` : '-';
                      })()}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 font-bold text-green-600 text-lg">
                  {formatCurrency(processedTransactions.reduce((sum, sale) => sum + sale.finalTotal, 0))}
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Transaksi</span>
                    <span className="font-bold text-indigo-600 text-lg">{processedTransactions.length}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Rata-rata</span>
                    <span className="font-bold text-blue-600 text-sm">
                      {formatCurrency(processedTransactions.length > 0 ? 
                        processedTransactions.reduce((sum, sale) => sum + sale.finalTotal, 0) / processedTransactions.length : 0
                      )}
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      {processedTransactions.length > 0 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Menampilkan {processedTransactions.length} dari {filteredSales.length} transaksi
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
              <i className="fas fa-chevron-left mr-1"></i>Sebelumnya
            </button>
            <span className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg font-medium">1</span>
            <button className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
              Selanjutnya<i className="fas fa-chevron-right ml-1"></i>
            </button>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        mode={modalMode}
      />
    </div>
  );
};

export default TransactionHistory;