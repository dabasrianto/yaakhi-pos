import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';
import Cart from './Cart';
import { useData } from '../../context/DataContext';

const POSPage: React.FC = () => {
  const { products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<any[]>([]);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return;

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
      if (cartItem.quantity < product.stock) {
        setCart(prev => prev.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
    } else {
      setCart(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: string, change: number) => {
    const cartItem = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    if (!cartItem || !product) return;

    const newQuantity = cartItem.quantity + change;
    if (newQuantity > product.stock) return;

    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      setCart(prev => prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
      {/* Product List */}
      <div className="lg:col-span-2">
        <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3 lg:mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm lg:text-base"
          />
          
          <div className="mb-3 lg:mb-4">
            <h3 className="text-xs lg:text-sm font-semibold text-slate-600 mb-2">Kategori</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-2 lg:px-3 py-1 text-xs lg:text-sm rounded-full border border-slate-300 capitalize ${
                    activeCategory === category ? 'bg-indigo-500 text-white border-indigo-500' : ''
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <ProductList
            products={filteredProducts}
            onAddToCart={addToCart}
          />
        </div>
      </div>

      {/* Cart */}
      <div className="lg:col-span-1">
        <Cart
          cart={cart}
          onUpdateQuantity={updateCartQuantity}
          onClearCart={() => setCart([])}
        />
      </div>
    </div>
  );
};

export default POSPage;