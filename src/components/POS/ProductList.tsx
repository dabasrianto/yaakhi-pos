import React from 'react';
import { formatCurrency, hexToRgba } from '../../utils/formatters';

interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  stock: number;
  icon?: string;
  iconColor?: string;
}

interface ProductListProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart }) => {
  if (products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
        <p className="text-slate-500 col-span-full text-center">Produk tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-4 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto p-1">
      {products.map(product => {
        const iconClass = product.icon || 'fas fa-box-open';
        const iconColor = product.iconColor || '#6366f1';
        const bgColor = hexToRgba(iconColor, 0.15);
        const isOutOfStock = product.stock <= 0;
        const isLowStock = product.stock <= 3 && product.stock > 0;

        let cardClasses = 'border rounded-lg p-2 lg:p-3 transition-all transform flex flex-col lg:flex-row items-center gap-2 lg:gap-4';
        
        if (isOutOfStock) {
          cardClasses += ' opacity-50 bg-slate-100 border-slate-200';
        } else if (isLowStock) {
          cardClasses += ' bg-yellow-50 border-yellow-300 hover:shadow-md';
        } else {
          cardClasses += ' bg-white border-slate-200 hover:shadow-md cursor-pointer';
        }

        return (
          <div 
            key={product.id} 
            className={cardClasses + (isOutOfStock ? '' : ' cursor-pointer')}
            title={`${product.name} - ${formatCurrency(product.price)} - Stok: ${product.stock}`}
            onClick={() => !isOutOfStock && onAddToCart(product.id)}
          >
            <div
              className="w-12 h-12 lg:w-16 lg:h-16 flex-shrink-0 flex items-center justify-center rounded-lg text-xl lg:text-3xl"
              style={{ backgroundColor: bgColor, color: iconColor }}
            >
              <i className={iconClass}></i>
            </div>
            
            <div className="flex-grow w-full text-center lg:text-left">
              <h4 className="text-xs text-slate-500 truncate hidden lg:block">{product.brand || 'Tanpa Merek'}</h4>
              <h3 className="font-semibold text-slate-700 leading-tight text-xs lg:text-sm truncate">{product.name}</h3>
              <div className="flex flex-col lg:flex-row lg:items-baseline gap-1 lg:gap-3 mt-1">
                <p className="font-bold text-xs lg:text-sm" style={{ color: iconColor }}>
                  {formatCurrency(product.price)}
                </p>
                <p className="text-xs text-slate-500">Stok: {product.stock}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;