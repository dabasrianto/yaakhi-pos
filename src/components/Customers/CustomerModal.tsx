import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, customer }) => {
  const { addCustomer, updateCustomer } = useData();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Tidak Disebutkan',
    address: '',
    wallet: '0'
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        gender: customer.gender || 'Tidak Disebutkan',
        address: customer.address || '',
        wallet: (customer.wallet || 0).toString()
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        gender: 'Tidak Disebutkan',
        address: '',
        wallet: '0'
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      gender: formData.gender,
      address: formData.address,
      wallet: parseFloat(formData.wallet) || 0
    };

    try {
      if (customer) {
        await updateCustomer(customer.id, customerData);
      } else {
        await addCustomer(customerData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Gagal menyimpan data pelanggan. Coba lagi.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
          {customer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Pelanggan</label>
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

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">No. Telepon</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Opsional"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Opsional"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Jenis Kelamin</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option>Tidak Disebutkan</option>
              <option>Laki-laki</option>
              <option>Perempuan</option>
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">Alamat</label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Opsional"
            />
          </div>

          {customer && (
            <div>
              <label htmlFor="wallet" className="block text-sm font-medium text-slate-700">Saldo</label>
              <input
                type="number"
                id="wallet"
                name="wallet"
                value={formData.wallet}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
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

export default CustomerModal;