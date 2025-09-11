import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import CustomerModal from './CustomerModal';
import { formatCurrency } from '../../utils/formatters';

const CustomerPage: React.FC = () => {
  const { customers, sales, deleteCustomer } = useData();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus pelanggan ini?')) {
      try {
        await deleteCustomer(id);
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Gagal menghapus pelanggan. Coba lagi.');
      }
    }
  };

  const exportCustomersToCSV = () => {
    if (customers.length === 0) {
      alert('Tidak ada data pelanggan untuk diekspor.');
      return;
    }

    let csvContent = "ID,Nama,Telepon,Email,Jenis Kelamin,Alamat,Saldo\n";
    customers.forEach(customer => {
      const row = [
        customer.id,
        `"${(customer.name || '').replace(/"/g, '""')}"`,
        `"${(customer.phone || '').replace(/"/g, '""')}"`,
        `"${(customer.email || '').replace(/"/g, '""')}"`,
        `"${(customer.gender || '').replace(/"/g, '""')}"`,
        `"${(customer.address || '').replace(/"/g, '""')}"`,
        customer.wallet || 0
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_pelanggan_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-700">Daftar Pelanggan</h2>
        <div className="flex gap-2">
          <button
            onClick={exportCustomersToCSV}
            className="text-sm bg-blue-100 text-blue-800 font-semibold px-3 py-2 rounded-lg hover:bg-blue-200"
          >
            <i className="fas fa-file-download mr-2"></i>Ekspor Pelanggan
          </button>
          <button
            onClick={handleAddCustomer}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition duration-300"
          >
            <i className="fas fa-user-plus mr-2"></i>Tambah
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-medium text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" />
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Pelanggan</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Kontak</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Total Belanja</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Kunjungan Terakhir</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Saldo</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500">
                  Belum ada pelanggan.
                </td>
              </tr>
            ) : (
              customers.map(customer => {
                const customerSales = sales.filter(sale => sale.customer && sale.customer.id === customer.id);
                const totalSpent = customerSales.reduce((sum, sale) => sum + sale.finalTotal, 0);
                const lastVisit = customerSales.length > 0
                  ? new Date(customerSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date).toLocaleDateString('id-ID')
                  : 'Belum ada';

                return (
                  <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{customer.name}</p>
                          <p className="text-sm text-slate-500">{customer.gender || 'Tidak Disebutkan'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-slate-600">{customer.phone || '-'}</p>
                        <p className="text-sm text-slate-500">{customer.email || '-'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-green-600">
                      {formatCurrency(totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {lastVisit}
                    </td>
                    <td className="py-3 px-4 font-medium text-amber-600">
                      {formatCurrency(customer.wallet || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div>
        {customers.length === 0 ? (
          <p className="text-slate-500 text-center py-4">Belum ada pelanggan.</p>
        ) : (
          customers.map(customer => {
            const customerSales = sales.filter(sale => sale.customer && sale.customer.id === customer.id);
            const totalSpent = customerSales.reduce((sum, sale) => sum + sale.finalTotal, 0);
            const lastVisit = customerSales.length > 0
              ? new Date(customerSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date).toLocaleDateString('id-ID')
              : 'Belum ada';

            return (
              <div key={customer.id} className="flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-slate-100">
                <div className="flex-grow">
                  <p className="font-semibold text-slate-700">{customer.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{customer.phone || 'No. telepon tidak ada'}</p>
                  <p className="text-sm text-slate-500 mt-1">{customer.email || 'Email tidak ada'}</p>
                  <p className="text-sm text-slate-500 mt-1">{customer.address || 'Alamat tidak ada'}</p>
                  <div className="flex gap-4 text-xs mt-2 text-slate-600">
                    <span>Total Belanja: <span className="font-semibold text-green-600">{formatCurrency(totalSpent)}</span></span>
                    <span>Kunjungan Terakhir: <span className="font-semibold">{lastVisit}</span></span>
                    <span>Saldo: <span className="font-semibold text-amber-600">{formatCurrency(customer.wallet || 0)}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => handleEditCustomer(customer)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Hapus"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customer={editingCustomer}
      />
    </div>
  );
};

export default CustomerPage;