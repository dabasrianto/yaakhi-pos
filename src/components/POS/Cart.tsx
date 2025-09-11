import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import PaymentModal from '../Modals/PaymentModal';
import DiscountModal from '../Modals/DiscountModal';
import TaxModal from '../Modals/TaxModal';
import { useSettings } from '../../context/SettingsContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, change: number) => void;
  onClearCart: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, onUpdateQuantity, onClearCart }) => {
  const { settings } = useSettings();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [discount, setDiscount] = useState({ type: 'rp', value: 0 });
  const [tax, setTax] = useState({ type: 'percent', value: settings.taxRate });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let discountAmount = 0;
  const discountValue = Number(discount.value);
  
  if (!isNaN(discountValue) && isFinite(discountValue)) {
    discountAmount = discount.type === 'percent' 
      ? (subtotal * discountValue) / 100 
      : discountValue;
    
    if (discountAmount > subtotal) discountAmount = subtotal;
    if (discountAmount < 0) discountAmount = 0;
  }
  
  const taxableAmount = subtotal - discountAmount;
  let taxAmount = 0;
  const taxValue = Number(tax.value);
  
  if (!isNaN(taxValue) && isFinite(taxValue)) {
    taxAmount = tax.type === 'percent' 
      ? (taxableAmount * taxValue) / 100 
      : taxValue;
    
    if (taxAmount < 0) taxAmount = 0;
  }
  
  const total = taxableAmount + taxAmount;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    onClearCart();
    setDiscount({ type: 'rp', value: 0 });
    setTax({ type: 'percent', value: 11 });
    setShowPaymentModal(false);
  };

  return (
    <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm lg:sticky lg:top-4">
      <h2 className="text-base lg:text-lg font-semibold mb-3 text-slate-700">Keranjang</h2>
      
      <div className="divide-y divide-slate-200 max-h-[30vh] lg:max-h-[40vh] overflow-y-auto">
        {cart.length === 0 ? (
          <p className="text-slate-500 text-center py-4 text-sm">Keranjang kosong</p>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex justify-between items-center py-2 lg:py-3">
              <div>
                <p className="font-semibold text-slate-700 text-sm lg:text-base truncate pr-2">{item.name}</p>
                <p className="text-xs lg:text-sm text-slate-600">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-1.5 lg:gap-2.5">
                <button
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="bg-slate-200 rounded-full w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center text-slate-600 hover:bg-slate-300 text-sm"
                >
                  -
                </button>
                <span className="font-medium w-6 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="bg-slate-200 rounded-full w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center text-slate-600 hover:bg-slate-300 text-sm"
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-slate-200 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Diskon</span>
          <div>
            <span className="text-red-500 mr-1 lg:mr-2 font-medium text-xs lg:text-sm">- {formatCurrency(discountAmount)}</span>
            <button
              onClick={() => setShowDiscountModal(true)}
              className="bg-amber-100 text-amber-800 text-xs font-semibold px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md hover:bg-amber-200"
            >
              <i className="fas fa-pencil-alt"></i>
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Pajak</span>
          <div>
            <span className="text-green-600 mr-1 lg:mr-2 font-medium text-xs lg:text-sm">+ {formatCurrency(taxAmount)}</span>
            <button
              onClick={() => setShowTaxModal(true)}
              className="bg-teal-100 text-teal-800 text-xs font-semibold px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md hover:bg-teal-200"
            >
              <i className="fas fa-pencil-alt"></i>
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center font-bold text-base lg:text-lg pt-2 border-t mt-2">
          <span className="text-slate-700">Total</span>
          <span className="text-indigo-600">{formatCurrency(total)}</span>
        </div>
        
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="w-full disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-2.5 lg:py-3 mt-3 lg:mt-4 rounded-lg font-semibold transition duration-300 text-sm lg:text-base"
          style={{ 
            backgroundColor: cart.length === 0 ? '#94a3b8' : settings.themeColor || '#6366f1',
            ':hover': { backgroundColor: cart.length === 0 ? '#94a3b8' : settings.themeColor || '#6366f1' }
          }}
        >
          <i className="fas fa-shield-halved mr-1 lg:mr-2"></i>Bayar
        </button>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        cart={cart}
        discount={{ ...discount, amount: discountAmount }}
        tax={{ ...tax, amount: taxAmount }}
        subtotal={subtotal}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <DiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        discount={discount}
        onApply={setDiscount}
      />

      <TaxModal
        isOpen={showTaxModal}
        onClose={() => setShowTaxModal(false)}
        tax={tax}
        onApply={setTax}
      />
    </div>
  );
};

export default Cart;