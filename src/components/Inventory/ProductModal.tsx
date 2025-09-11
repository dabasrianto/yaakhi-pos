import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product }) => {
  const { addProduct, updateProduct } = useData();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    icon: '',
    iconColor: '#6366f1',
    costPrice: '',
    price: '',
    stock: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        category: product.category || '',
        icon: product.icon || '',
        iconColor: product.iconColor || '#6366f1',
        costPrice: product.costPrice?.toString() || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || ''
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        category: '',
        icon: '',
        iconColor: '#6366f1',
        costPrice: '',
        price: '',
        stock: ''
      });
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      brand: formData.brand.trim(),
      category: formData.category.trim() || 'Lainnya',
      icon: formData.icon.trim(),
      iconColor: formData.iconColor,
      costPrice: parseFloat(formData.costPrice),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };

    try {
      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await addProduct(productData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Gagal menyimpan data produk. Coba lagi.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-40">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl overflow-y-auto max-h-screen">
        <h2 className="text-xl font-bold mb-4 text-slate-800">
          {product ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Produk</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="brand" className="block text-sm font-medium text-slate-700">Merek</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Contoh: Indofood (Opsional)"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">Kategori</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Contoh: Makanan, Minuman"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="icon" className="block text-sm font-medium text-slate-700">Kelas Ikon FontAwesome</label>
            <input
              type="text"
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Contoh: fas fa-coffee, lni lni-coffee-cup"
            />
            <p className="text-xs text-slate-500 mt-1">
              Cari ikon di <a href="https://fontawesome.com/icons" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Font Awesome</a> atau <a href="https://lineicons.com/icons/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">LineIcons</a>.<br/>
              FontAwesome: fas fa-coffee, fas fa-hamburger, fas fa-wine-bottle<br/>
              LineIcons: lni lni-coffee-cup, lni lni-burger, lni lni-dinner
            </p>
          </div>

          {/* Icon Preview */}
          {formData.icon && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Preview Ikon</label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-lg text-2xl"
                  style={{ backgroundColor: `${formData.iconColor}20`, color: formData.iconColor }}
                >
                  <i className={formData.icon}></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Kelas: {formData.icon}</p>
                  <p className="text-xs text-slate-500">Warna: {formData.iconColor}</p>
                </div>
              </div>
            </div>
          )}

          {/* Popular Icons Suggestions */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Ikon Populer</label>
            <div className="grid grid-cols-6 gap-2">
              {[
                { icon: 'fas fa-coffee', name: 'Kopi' },
                { icon: 'fas fa-hamburger', name: 'Burger' },
                { icon: 'fas fa-pizza-slice', name: 'Pizza' },
                { icon: 'fas fa-ice-cream', name: 'Es Krim' },
                { icon: 'fas fa-wine-bottle', name: 'Minuman' },
                { icon: 'fas fa-bread-slice', name: 'Roti' },
                { icon: 'lni lni-coffee-cup', name: 'Kopi' },
                { icon: 'lni lni-burger', name: 'Burger' },
                { icon: 'lni lni-dinner', name: 'Makanan' },
                { icon: 'lni lni-cake', name: 'Kue' },
                { icon: 'lni lni-juice', name: 'Jus' },
                { icon: 'lni lni-restaurant', name: 'Restoran' }
              ].map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon: item.icon }))}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex flex-col items-center gap-1 text-xs"
                  title={item.name}
                >
                  <i className={`${item.icon} text-lg`} style={{ color: formData.iconColor }}></i>
                  <span className="text-xs text-slate-600 truncate w-full text-center">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="iconColor" className="block text-sm font-medium text-slate-700">Warna Ikon</label>
            <input
              type="color"
              id="iconColor"
              name="iconColor"
              value={formData.iconColor}
              onChange={handleInputChange}
              className="mt-1 block w-full h-12 px-1 py-1 border border-slate-300 rounded-lg shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-slate-700">Harga Modal</label>
              <input
                type="number"
                id="costPrice"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleInputChange}
                placeholder="Rp"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700">Harga Jual</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Rp"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="stock" className="block text-sm font-medium text-slate-700">Stok</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;