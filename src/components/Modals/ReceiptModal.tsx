import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { useSettings } from '../../context/SettingsContext';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale }) => {
  const { settings } = useSettings();
  
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start p-4 z-50 overflow-y-auto">
      <div className="bg-white p-6 w-full max-w-sm shadow-xl my-8 rounded-lg">
        <div className="text-center text-sm font-mono">
          {settings.logoUrl && (
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              className="w-16 h-16 mx-auto mb-2 object-contain"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          )}
          <h3 className="text-lg font-bold mb-1">{settings.storeName}</h3>
          {settings.storeAddress && (
            <p className="text-xs text-slate-600 mb-1">{settings.storeAddress}</p>
          )}
          {settings.storePhone && (
            <p className="text-xs text-slate-600 mb-2">Tel: {settings.storePhone}</p>
          )}
          <div className="border-t border-dashed border-slate-400 my-2"></div>
          <p className="text-xs">{sale.date.toLocaleString('id-ID')}</p>
          <p className="text-xs mb-4">ID: {sale.id}</p>
          
          <div className="border-t border-b border-dashed border-slate-400 py-2 my-2 text-left">
            {sale.items.map((item: any, index: number) => (
              <div key={index}>
                <p>{item.name}</p>
                <div className="flex justify-between">
                  <span>{item.quantity} x {formatCurrency(item.price)}</span>
                  <span>{formatCurrency(item.quantity * item.price)}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-left space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold">Subtotal:</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            
            {sale.discount.amount > 0 && (
              <div className="flex justify-between">
                <span className="font-semibold">Diskon:</span>
                <span>- {formatCurrency(sale.discount.amount)}</span>
              </div>
            )}
            
            {sale.tax.amount > 0 && (
              <div className="flex justify-between">
                <span className="font-semibold">Pajak:</span>
                <span>+ {formatCurrency(sale.tax.amount)}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold border-t border-slate-300 pt-1">
              <span className="font-bold">Total:</span>
              <span>{formatCurrency(sale.finalTotal)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Metode:</span>
              <span>{sale.paymentMethod}</span>
            </div>
            
            {sale.customer && (
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{sale.customer.name}</span>
              </div>
            )}
          </div>
          
          <p className="text-xs mt-6">--- {settings.receiptFooter} ---</p>
        </div>
        
        <button
          onClick={onClose}
          className="w-full text-white py-2.5 mt-6 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: settings.themeColor || '#6366f1' }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default ReceiptModal;