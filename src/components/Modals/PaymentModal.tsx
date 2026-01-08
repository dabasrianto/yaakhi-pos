import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import ReceiptModal from './ReceiptModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  cart: any[];
  discount: any;
  tax: any;
  subtotal: number;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  cart,
  discount,
  tax,
  subtotal,
  onPaymentSuccess,
}) => {
  const { customers, addSale, updateProduct, updateCustomer } = useData();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [selectedCustomer, setSelectedCustomer] = useState('0');
  const [isManualPayment, setIsManualPayment] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  React.useEffect(() => {
    if (isOpen && !customDate) {
      const now = new Date();
      setCustomDate(now.toISOString().split('T')[0]);
      setCustomTime(now.toTimeString().slice(0, 5));
    }
  }, [isOpen, customDate]);

  const handlePayment = async (paymentMethod: string) => {
    if (!user) return;

    const customer = customers.find((c) => c.id === selectedCustomer);

    if (paymentMethod === 'Saldo') {
      if (!customer || (customer.wallet || 0) < total) {
        alert('Saldo pelanggan tidak mencukupi.');
        return;
      }
    }

    let transactionDate = new Date();
    if (isManualPayment && customDate && customTime) {
      transactionDate = new Date(`${customDate}T${customTime}`);
    }

    const saleRecord = {
      date: transactionDate,
      items: [...cart],
      subtotal: subtotal,
      discount: { ...discount },
      tax: { ...tax },
      finalTotal: total,
      paymentMethod: paymentMethod,
      customer: customer ? { id: customer.id, name: customer.name } : undefined,
    };

    try {
      await addSale(saleRecord);

      for (const cartItem of cart) {
        const newStock = cartItem.stock - cartItem.quantity;
        await updateProduct(cartItem.id, { stock: newStock });
      }

      if (paymentMethod === 'Saldo' && customer) {
        const newWallet = (customer.wallet || 0) - total;
        await updateCustomer(customer.id, { wallet: newWallet });
      }

      setLastSale({ ...saleRecord, id: Date.now().toString() });
      setShowReceipt(true);
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Terjadi kesalahan saat memproses pembayaran.');
    }
  };

  if (!isOpen) return null;

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);
  const canPayWithWallet = selectedCustomerData && (selectedCustomerData.wallet || 0) >= total;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Lanjutkan Pembayaran</h2>

          <div className="mb-4">
            <label
              htmlFor="customer-select"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Pilih Pelanggan
            </label>
            <select
              id="customer-select"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="0">Tamu / Walk-in</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="manual-payment"
                checked={isManualPayment}
                onChange={(e) => setIsManualPayment(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <label
                htmlFor="manual-payment"
                className="ml-2 text-sm font-medium text-slate-700"
              >
                Pembayaran Manual (Atur Tanggal & Waktu)
              </label>
            </div>

            {isManualPayment && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="custom-date"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Tanggal
                  </label>
                  <input
                    type="date"
                    id="custom-date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="custom-time"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Waktu
                  </label>
                  <input
                    type="time"
                    id="custom-time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {isManualPayment && (
              <p className="text-xs text-slate-500 mt-2">
                <i className="fas fa-info-circle mr-1"></i>
                Transaksi akan dicatat pada:{' '}
                {customDate && customTime
                  ? new Date(`${customDate}T${customTime}`).toLocaleString('id-ID')
                  : 'Pilih tanggal dan waktu'}
              </p>
            )}
          </div>

          <div className="text-center">
            <p className="text-slate-600 mb-6">
              Total: <span className="font-bold">{formatCurrency(total)}</span>
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handlePayment('Saldo')}
                disabled={!canPayWithWallet}
                className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <i className="lni lni-wallet mr-2"></i>Bayar dengan Saldo
              </button>

              <button
                onClick={() => handlePayment('Tunai')}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                <i className="lni lni-money-location mr-2"></i>Tunai
              </button>

              <button
                onClick={() => handlePayment('Transfer Bank')}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                <i className="lni lni-bank mr-2"></i>Transfer Bank
              </button>

              <button
                onClick={() => handlePayment('E-Wallet')}
                className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition"
              >
                <i className="lni lni-mobile mr-2"></i>E-Wallet
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-1.5 text-white text-sm rounded-lg font-semibold transition-colors mt-4"
              style={{ backgroundColor: settings.themeColor || '#6366f1' }}
            >
              Batal
            </button>
          </div>
        </div>
      </div>

      <ReceiptModal isOpen={showReceipt} onClose={() => setShowReceipt(false)} sale={lastSale} />
    </>
  );
};

export default PaymentModal;
