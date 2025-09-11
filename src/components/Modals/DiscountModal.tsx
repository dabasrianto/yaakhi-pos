import React, { useState } from 'react';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: { type: string; value: number };
  onApply: (discount: { type: string; value: number }) => void;
}

const DiscountModal: React.FC<DiscountModalProps> = ({ isOpen, onClose, discount, onApply }) => {
  const [discountType, setDiscountType] = useState(discount.type);
  const [discountValue, setDiscountValue] = useState(discount.value.toString());

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      type: discountType,
      value: parseFloat(discountValue) || 0
    });
    onClose();
  };

  const handleRemove = () => {
    onApply({ type: 'rp', value: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Masukkan Diskon</h2>
        
        <div className="flex mb-4">
          <button
            onClick={() => setDiscountType('rp')}
            className={`flex-1 py-2 text-sm rounded-l-lg border border-slate-300 ${
              discountType === 'rp' ? 'bg-indigo-500 text-white border-indigo-500' : ''
            }`}
          >
            Rp
          </button>
          <button
            onClick={() => setDiscountType('percent')}
            className={`flex-1 py-2 text-sm rounded-r-lg border border-slate-300 border-l-0 ${
              discountType === 'percent' ? 'bg-indigo-500 text-white border-indigo-500' : ''
            }`}
          >
            %
          </button>
        </div>
        
        <input
          type="number"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        
        <div className="flex justify-end gap-3">
          <button
            onClick={handleRemove}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 text-sm"
          >
            Hapus Diskon
          </button>
          <button
            onClick={handleApply}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            <i className="lni lni-checkmark mr-1"></i>Terapkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountModal;