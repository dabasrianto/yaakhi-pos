import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import ProductModal from './ProductModal';
import InventoryReports from './InventoryReports';
import FinancialReport from './FinancialReport';
import { formatCurrency } from '../../utils/formatters';

const InventoryPage: React.FC = () => {
  const { products, deleteProduct } = useData();
  const [activeTab, setActiveTab] = useState('list');
  const [isFinancialReportEnabled, setIsFinancialReportEnabled] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Gagal menghapus produk. Coba lagi.');
      }
    }
  };

  const exportStockToCSV = () => {
    if (products.length === 0) {
      alert('Tidak ada produk untuk diekspor.');
      return;
    }

    let csvContent = "ID Produk,Nama Produk,Merek,Kategori,Stok Saat Ini\n";
    products.forEach(product => {
      const row = [
        product.id,
        `"${product.name.replace(/"/g, '""')}"`,
        `"${(product.brand || '').replace(/"/g, '""')}"`,
        `"${product.category.replace(/"/g, '""')}"`,
        product.stock
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_stok_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Financial Report Toggle */}
      <div className="mb-4 bg-white p-3 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="financial-toggle"
                checked={isFinancialReportEnabled}
                onChange={(e) => {
                  setIsFinancialReportEnabled(e.target.checked);
                  if (!e.target.checked && activeTab === 'financial') {
                    setActiveTab('list');
                  }
                }}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <label htmlFor="financial-toggle" className="ml-2 text-sm font-medium text-gray-700">
                Aktifkan Laporan Keuangan
              </label>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Optional
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {isFinancialReportEnabled ? 'Fitur aktif' : 'Fitur nonaktif'}
          </div>
        </div>
        {isFinancialReportEnabled && (
          <p className="text-xs text-gray-600 mt-2 pl-6">
            Asisten laporan keuangan untuk membuat laporan laba rugi dan bagi hasil
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-4 border-b border-slate-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('list')}
            className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
              activeTab === 'list'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            Daftar Produk
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
              activeTab === 'reports'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            Laporan Inventori
          </button>
          {isFinancialReportEnabled && (
            <button
              onClick={() => setActiveTab('financial')}
              className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
                activeTab === 'financial'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              Laporan Keuangan
            </button>
          )}
          <button
            onClick={() => setActiveTab('financial')}
            className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
              activeTab === 'financial'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            Laporan Keuangan
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' ? (
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4 gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-700">Daftar Produk</h2>
              <p className="text-sm text-slate-500">{products.length} Total produk</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportStockToCSV}
                className="text-sm bg-blue-100 text-blue-800 font-semibold px-3 py-2 rounded-lg hover:bg-blue-200"
              >
                <i className="fas fa-file-download mr-2"></i>Ekspor Stok
              </button>
              <button
                onClick={handleAddProduct}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition duration-300"
              >
                <i className="fas fa-plus mr-2"></i>Tambah
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari produk..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Semua Kategori</option>
                {[...new Set(products.map(p => p.category))].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Semua Status</option>
                <option>Tersedia</option>
                <option>Stok Rendah</option>
                <option>Habis</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Produk</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">ID Produk</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Kategori</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Stok</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Harga Modal</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Harga Jual</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      Belum ada produk.
                    </td>
                  </tr>
                ) : (
                  products
                    .sort((a, b) => a.category.localeCompare(b.category))
                    .map(product => {
                      const isOutOfStock = product.stock <= 0;
                      const isLowStock = product.stock <= 3 && product.stock > 0;
                      const iconClass = product.icon || 'fas fa-box-open';
                      const iconColor = product.iconColor || '#6366f1';

                      return (
                        <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <input type="checkbox" className="rounded border-slate-300" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 flex items-center justify-center rounded-lg text-lg"
                                style={{ backgroundColor: `${iconColor}20`, color: iconColor }}
                              >
                                <i className={iconClass}></i>
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{product.name}</p>
                                <p className="text-sm text-slate-500">{product.brand || 'Tanpa Merek'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-sm">
                            {product.id.substring(0, 8)}...
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-yellow-400' : 'bg-green-400'
                              }`}></div>
                              <span className="font-medium">{product.stock}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {formatCurrency(product.costPrice)}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isOutOfStock 
                                ? 'bg-red-100 text-red-800' 
                                : isLowStock 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {isOutOfStock ? 'Habis' : isLowStock ? 'Stok Rendah' : 'Tersedia'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <i className="fas fa-edit text-sm"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
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
        </div>
      ) : activeTab === 'reports' ? (
        <InventoryReports />
      ) : activeTab === 'financial' ? (
        <FinancialReport />
      ) : null}

      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={editingProduct}
      />
    </div>
  );
};

export default InventoryPage;