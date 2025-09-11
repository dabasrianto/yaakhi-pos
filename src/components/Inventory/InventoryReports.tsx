import React from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/formatters';

const InventoryReports: React.FC = () => {
  const { products, sales } = useData();

  const calculateAssetValues = () => {
    let totalCost = 0;
    let totalRevenue = 0;
    
    products.forEach(p => {
      const costPrice = Number(p.costPrice);
      const price = Number(p.price);
      const stock = Number(p.stock);
      
      if (!isNaN(costPrice) && !isNaN(stock) && isFinite(costPrice) && isFinite(stock)) {
        totalCost += costPrice * stock;
      }
      
      if (!isNaN(price) && !isNaN(stock) && isFinite(price) && isFinite(stock)) {
        totalRevenue += price * stock;
      }
    });

    return {
      totalCost: isNaN(totalCost) ? 0 : totalCost,
      totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
      totalProfit: isNaN(totalRevenue - totalCost) ? 0 : totalRevenue - totalCost
    };
  };

  const getProductSalesData = () => {
    const salesCount: { [key: string]: number } = {};
    
    sales.forEach(sale => {
      sale.items.forEach((item: any) => {
        salesCount[item.id] = (salesCount[item.id] || 0) + item.quantity;
      });
    });

    const soldProductIds = new Set(Object.keys(salesCount));
    
    const soldProducts = products
      .filter(p => soldProductIds.has(p.id))
      .map(p => ({ ...p, count: salesCount[p.id] }))
      .sort((a, b) => b.count - a.count);

    const unsoldProducts = products.filter(p => !soldProductIds.has(p.id));

    return {
      bestsellers: soldProducts.slice(0, 5),
      stagnant: soldProducts.slice(-5).reverse(),
      unsold: unsoldProducts
    };
  };

  const { totalCost, totalRevenue, totalProfit } = calculateAssetValues();
  const { bestsellers, stagnant, unsold } = getProductSalesData();

  const renderProductItem = (product: any, count: number) => (
    <div key={product.id} className="flex justify-between items-center text-sm py-1">
      <span className="truncate pr-2">{product.name}</span>
      <span className="font-bold text-slate-600">{count} terjual</span>
    </div>
  );

  const renderUnsoldItem = (product: any) => (
    <div key={product.id} className="flex justify-between items-center text-sm py-1">
      <span className="truncate pr-2">{product.name}</span>
      <span className="text-xs text-slate-400">Stok: {product.stock}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Asset Values */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Nilai Aset Inventori</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-500 text-sm">Total Nilai Modal</h3>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalCost)}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-500 text-sm">Potensi Pemasukan</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-500 text-sm">Potensi Keuntungan</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
          </div>
        </div>
      </div>

      {/* Product Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-3">Produk Terlaris</h3>
          <div className="space-y-2">
            {bestsellers.length > 0 ? (
              bestsellers.map(p => renderProductItem(p, p.count))
            ) : (
              <p className="text-sm text-slate-400">Belum ada produk terlaris.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-3">Produk Kurang Laku</h3>
          <div className="space-y-2">
            {stagnant.length > 0 ? (
              stagnant.map(p => renderProductItem(p, p.count))
            ) : (
              <p className="text-sm text-slate-400">Belum ada produk kurang laku.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-3">Produk Tidak Terjual</h3>
          <div className="space-y-2">
            {unsold.length > 0 ? (
              unsold.map(p => renderUnsoldItem(p))
            ) : (
              <p className="text-sm text-slate-400">Semua produk pernah terjual.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;