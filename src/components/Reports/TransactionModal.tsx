import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatters';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  mode: 'view' | 'edit';
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  mode,
}) => {
  const { customers } = useData();
  const { settings } = useSettings();
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(mode === 'edit');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: '',
    customerId: '',
    discount: { type: 'rp', value: 0, amount: 0 },
    tax: { type: 'percent', value: 11, amount: 0 },
    notes: '',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        paymentMethod: transaction.paymentMethod || 'Tunai',
        customerId: transaction.customer?.id || '0',
        discount: transaction.discount || { type: 'rp', value: 0, amount: 0 },
        tax: transaction.tax || { type: 'percent', value: 11, amount: 0 },
        notes: transaction.notes || '',
      });
    }
  }, [transaction]);

  const handleSave = async () => {
    if (!user || !transaction) return;

    setLoading(true);
    try {
      const customer = customers.find((c) => c.id === formData.customerId);

      let discountAmount = 0;
      if (formData.discount.type === 'percent') {
        discountAmount = (transaction.subtotal * formData.discount.value) / 100;
      } else {
        discountAmount = formData.discount.value;
      }

      let taxAmount = 0;
      const taxableAmount = transaction.subtotal - discountAmount;
      if (formData.tax.type === 'percent') {
        taxAmount = (taxableAmount * formData.tax.value) / 100;
      } else {
        taxAmount = formData.tax.value;
      }

      const finalTotal = taxableAmount + taxAmount;

      await supabase
        .from('sales')
        .update({
          payment_method: formData.paymentMethod,
          customer_id: customer?.id || null,
          customer_name: customer?.name || '',
          discount: { ...formData.discount, amount: discountAmount },
          tax: { ...formData.tax, amount: taxAmount },
          final_total: finalTotal,
        })
        .eq('id', transaction.id)
        .eq('user_id', user.id);

      setEditMode(false);
      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Gagal mengupdate transaksi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !transaction) return;

    if (
      !window.confirm('Yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.')
    ) {
      return;
    }

    setLoading(true);
    try {
      await supabase.from('sales').delete().eq('id', transaction.id).eq('user_id', user.id);

      onClose();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Gagal menghapus transaksi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editMode ? 'Edit Transaksi' : 'Detail Transaksi'}
            </h2>
            <p className="text-sm text-slate-500">ID: {transaction.id}</p>
          </div>
          <div className="flex gap-2">
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <i className="fas fa-edit mr-1"></i>Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              <i className="fas fa-trash mr-1"></i>Hapus
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <i className="fas fa-times mr-1"></i>Tutup
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transaction Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tanggal & Waktu
              </label>
              <p className="text-slate-800 bg-slate-50 p-2 rounded-lg">
                {new Date(transaction.date).toLocaleString('id-ID')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pelanggan
              </label>
              {editMode ? (
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="0">Tamu / Walk-in</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-slate-800 bg-slate-50 p-2 rounded-lg">
                  {transaction.customer ? transaction.customer.name : 'Tamu / Walk-in'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              {editMode ? (
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Tunai">Tunai</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="E-Wallet">E-Wallet</option>
                  <option value="Saldo">Saldo</option>
                </select>
              ) : (
                <p className="text-slate-800 bg-slate-50 p-2 rounded-lg">
                  {transaction.paymentMethod}
                </p>
              )}
            </div>

            {editMode && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Catatan tambahan..."
                />
              </div>
            )}
          </div>

          {/* Items & Pricing */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Item Transaksi
              </label>
              <div className="bg-slate-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                {transaction.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-1 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-slate-500">{item.quantity} x {formatCurrency(item.price)}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(transaction.subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Diskon:</span>
                <span className="text-red-600">
                  -{formatCurrency(formData.discount.amount)}
                  {editMode && (
                    <button
                      onClick={() => {/* Open discount modal */}}
                      className="ml-2 text-xs bg-red-100 px-1 py-0.5 rounded"
                    >
                      Edit
                    </button>
                  )}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Pajak:</span>
                <span className="text-green-600">
                  +{formatCurrency(formData.tax.amount)}
                  {editMode && (
                    <button
                      onClick={() => {/* Open tax modal */}}
                      className="ml-2 text-xs bg-green-100 px-1 py-0.5 rounded"
                    >
                      Edit
                    </button>
                  )}
                </span>
              </div>
              
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-indigo-600">{formatCurrency(transaction.finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {editMode && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white rounded-lg font-semibold flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionModal;