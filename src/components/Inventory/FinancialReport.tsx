import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface IncomeItem {
  id: string;
  name: string;
  amount: number;
}

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

interface ProfitShareItem {
  id: string;
  name: string;
  percentage: number;
}

const FinancialReport: React.FC = () => {
  const [modal, setModal] = useState<number>(5967000);
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([
    { id: '1', name: 'Penjualan Toko', amount: 9720000 }
  ]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([
    { id: '1', name: 'Sewa Toko', amount: 3000000 },
    { id: '2', name: 'Air & Listrik', amount: 715000 },
    { id: '3', name: 'Gaji Karyawan', amount: 500000 }
  ]);
  const [profitShareItems, setProfitShareItems] = useState<ProfitShareItem[]>([
    { id: '1', name: 'Bapak A', percentage: 35 },
    { id: '2', name: 'Bapak B', percentage: 35 },
    { id: '3', name: 'Keuntungan Toko', percentage: 30 }
  ]);
  const [template, setTemplate] = useState<string>('standar');
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  // Calculations
  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const grossProfit = totalIncome - modal;
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = grossProfit - totalExpenses;
  const totalPercentage = profitShareItems.reduce((sum, item) => sum + item.percentage, 0);

  const formatRupiahInput = (value: string): string => {
    const number = value.replace(/[^,\d]/g, '');
    const split = number.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
    
    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    
    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah;
  };

  const parseRupiahInput = (value: string): number => {
    return parseFloat(value.replace(/\./g, '').replace(/,/g, '.')) || 0;
  };

  const addIncomeItem = () => {
    const newId = Date.now().toString();
    setIncomeItems([...incomeItems, { id: newId, name: '', amount: 0 }]);
  };

  const updateIncomeItem = (id: string, field: 'name' | 'amount', value: string | number) => {
    setIncomeItems(items => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeIncomeItem = (id: string) => {
    setIncomeItems(items => items.filter(item => item.id !== id));
  };

  const addExpenseItem = () => {
    const newId = Date.now().toString();
    setExpenseItems([...expenseItems, { id: newId, name: '', amount: 0 }]);
  };

  const updateExpenseItem = (id: string, field: 'name' | 'amount', value: string | number) => {
    setExpenseItems(items => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeExpenseItem = (id: string) => {
    setExpenseItems(items => items.filter(item => item.id !== id));
  };

  const addProfitShareItem = () => {
    const newId = Date.now().toString();
    setProfitShareItems([...profitShareItems, { id: newId, name: '', percentage: 0 }]);
  };

  const updateProfitShareItem = (id: string, field: 'name' | 'percentage', value: string | number) => {
    setProfitShareItems(items => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeProfitShareItem = (id: string) => {
    setProfitShareItems(items => items.filter(item => item.id !== id));
  };

  const generateReport = (): string => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('id-ID', { month: 'long' });
    const year = currentDate.getFullYear();
    
    let report = `Assalamu'alaykum Warahmatullahi Wabarakatuh\n\nYth. Bapak/Ibu,\nBerikut adalah laporan keuangan periode ${month} ${year}.\n\n`;

    // Headers based on template
    let incomeHeader = '';
    let expenseHeader = '';
    let profitShareHeader = '';

    switch (template) {
      case 'modern':
        incomeHeader = `📈 RINCIAN PENDAPATAN\n-----------------------------------\n`;
        expenseHeader = `\n🧾 RINCIAN BEBAN OPERASIONAL\n-----------------------------------\n`;
        profitShareHeader = `\n💰 RINCIAN BAGI HASIL\n-----------------------------------\n`;
        break;
      case 'minimalis':
        incomeHeader = `Rincian Pendapatan\n`;
        expenseHeader = `\nRincian Beban Operasional\n`;
        profitShareHeader = `\nRincian Bagi Hasil\n`;
        break;
      default:
        incomeHeader = `===================================\nRINCIAN PENDAPATAN\n===================================\n`;
        expenseHeader = `\n===================================\nRINCIAN BEBAN OPERASIONAL\n===================================\n`;
        profitShareHeader = `\n===================================\nRINCIAN BAGI HASIL\n===================================\n`;
        break;
    }

    // Income section
    report += incomeHeader;
    incomeItems.forEach(item => {
      if (item.amount > 0) {
        const prefix = template === 'minimalis' ? '   - ' : '- ';
        report += `${prefix}${item.name || 'Pendapatan Lain'}: ${formatCurrency(item.amount)}\n`;
      }
    });
    report += `Total Pendapatan (Omset): ${formatCurrency(totalIncome)}\n`;

    // Profit/Loss section
    report += `\n===================================\nLAPORAN LABA RUGI\n===================================\n`;
    report += `Total Pendapatan   : ${formatCurrency(totalIncome)}\n`;
    report += `Total Modal (HPP)  : (${formatCurrency(modal)})\n`;
    report += `-----------------------------------\n`;
    report += `Laba Kotor         : ${formatCurrency(grossProfit)}\n\n`;
    report += `Total Pengeluaran  : (${formatCurrency(totalExpenses)})\n`;
    report += `-----------------------------------\n`;
    report += `Laba/Rugi Bersih   : ${formatCurrency(netProfit)} ${netProfit >= 0 ? "✅" : "❌"}\n`;
    report += `===================================\n`;

    // Expenses section
    report += expenseHeader;
    if (expenseItems.length > 0 && expenseItems.some(item => item.amount > 0)) {
      expenseItems.forEach(item => {
        if (item.amount > 0) {
          const prefix = template === 'minimalis' ? '   - ' : '- ';
          report += `${prefix}${item.name || 'Lain-lain'}: ${formatCurrency(item.amount)}\n`;
        }
      });
    } else {
      const noExpenseText = template === 'minimalis' 
        ? '   (Tidak ada pengeluaran)\n' 
        : '- Tidak ada pengeluaran operasional bulan ini.\n';
      report += noExpenseText;
    }

    // Profit sharing section (only if profitable)
    if (netProfit > 0) {
      report += profitShareHeader;
      profitShareItems.forEach(item => {
        if (item.percentage > 0) {
          const amount = (item.percentage / 100) * netProfit;
          const prefix = template === 'minimalis' ? '   > ' : '> ';
          report += `${prefix}${item.name || 'Tanpa Nama'} (${item.percentage}%): ${formatCurrency(amount)}\n`;
        }
      });
    }

    return report.trim();
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(generateReport());
      setCopyFeedback('Laporan berhasil disalin!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (error) {
      setCopyFeedback('Gagal menyalin laporan');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const shareToWhatsApp = () => {
    const reportText = generateReport();
    const encodedText = encodeURIComponent(reportText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Asisten Laporan Keuangan</h2>
          <p className="text-gray-500 mb-6">Ikuti langkah-langkah di bawah untuk membuat laporan.</p>
        </div>

        {/* Step 1: Income & Capital */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 text-indigo-600 font-bold rounded-full h-8 w-8 flex items-center justify-center">1</div>
            <h3 className="text-xl font-semibold text-gray-800">Pendapatan & Modal</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-base font-medium text-gray-700 mb-3">Rincian Pendapatan</h4>
              <div className="space-y-3">
                {incomeItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateIncomeItem(item.id, 'name', e.target.value)}
                      className="flex-grow p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nama Pendapatan"
                    />
                    <input
                      type="text"
                      value={item.amount > 0 ? formatRupiahInput(item.amount.toString()) : ''}
                      onChange={(e) => updateIncomeItem(item.id, 'amount', parseRupiahInput(e.target.value))}
                      className="w-40 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                      placeholder="0"
                    />
                    <button
                      onClick={() => removeIncomeItem(item.id)}
                      className="bg-red-100 text-red-600 rounded-full h-8 w-8 flex items-center justify-center font-bold hover:bg-red-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addIncomeItem}
                className="mt-3 text-sm bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-300"
              >
                + Tambah Pendapatan
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Total Modal (HPP)</label>
              <input
                type="text"
                value={formatRupiahInput(modal.toString())}
                onChange={(e) => setModal(parseRupiahInput(e.target.value))}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 text-indigo-600 font-bold rounded-full h-8 w-8 flex items-center justify-center">2</div>
            <h3 className="text-xl font-semibold text-gray-800">Rincian Beban Operasional</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Masukkan semua biaya operasional di bawah ini.</p>
            <div className="space-y-3">
              {expenseItems.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateExpenseItem(item.id, 'name', e.target.value)}
                    className="flex-grow p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nama Pengeluaran"
                  />
                  <input
                    type="text"
                    value={item.amount > 0 ? formatRupiahInput(item.amount.toString()) : ''}
                    onChange={(e) => updateExpenseItem(item.id, 'amount', parseRupiahInput(e.target.value))}
                    className="w-40 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    placeholder="0"
                  />
                  <button
                    onClick={() => removeExpenseItem(item.id)}
                    className="bg-red-100 text-red-600 rounded-full h-8 w-8 flex items-center justify-center font-bold hover:bg-red-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addExpenseItem}
              className="mt-3 text-sm bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-300"
            >
              + Tambah Beban
            </button>
          </div>
        </div>

        {/* Step 3: Profit Sharing */}
        <div className={`bg-white p-6 rounded-xl shadow-sm border ${netProfit <= 0 ? 'opacity-60' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 text-indigo-600 font-bold rounded-full h-8 w-8 flex items-center justify-center">3</div>
            <h3 className="text-xl font-semibold text-gray-800">Skema Bagi Hasil</h3>
          </div>
          
          {netProfit <= 0 ? (
            <p className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
              Skema bagi hasil hanya aktif jika usaha mendapatkan keuntungan (laba bersih positif).
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {profitShareItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateProfitShareItem(item.id, 'name', e.target.value)}
                      className="flex-grow p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nama Penerima"
                    />
                    <input
                      type="number"
                      value={item.percentage || ''}
                      onChange={(e) => updateProfitShareItem(item.id, 'percentage', parseFloat(e.target.value) || 0)}
                      className="w-24 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                      placeholder="0"
                      min="0"
                    />
                    <span className="font-semibold text-gray-500">%</span>
                    <button
                      onClick={() => removeProfitShareItem(item.id)}
                      className="bg-red-100 text-red-600 rounded-full h-8 w-8 flex items-center justify-center font-bold hover:bg-red-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addProfitShareItem}
                className="mt-3 text-sm bg-green-50 text-green-700 font-semibold py-2 px-4 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 border border-green-200"
              >
                + Tambah Penerima
              </button>
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800">Total Persentase:</h4>
                  <p className={`text-2xl font-bold ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPercentage}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Output */}
      <div className="flex flex-col bg-slate-50 rounded-2xl p-6 border border-gray-200">
        {/* Summary */}
        <div className="mb-5">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Ringkasan Keuangan</h3>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-600">Laba Kotor</span>
              <span className="font-bold text-lg text-gray-800">{formatCurrency(grossProfit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-600">Total Pengeluaran</span>
              <span className="font-bold text-lg text-red-500">({formatCurrency(totalExpenses)})</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800 text-lg">Laba / Rugi Bersih</span>
              <span className={`font-extrabold text-2xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* Report */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-gray-800">Laporan Final</h3>
          <div className="flex items-center gap-2">
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2"
            >
              <option value="standar">Gaya Standar</option>
              <option value="modern">Gaya Modern</option>
              <option value="minimalis">Gaya Minimalis</option>
            </select>
            <button
              onClick={copyReport}
              title="Salin Laporan"
              className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <i className="fas fa-copy"></i>
            </button>
            <button
              onClick={shareToWhatsApp}
              title="Bagikan ke WhatsApp"
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <i className="fab fa-whatsapp"></i>
            </button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex-grow overflow-y-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
            {generateReport()}
          </pre>
        </div>
        
        {copyFeedback && (
          <div className="text-center text-green-600 font-medium mt-2 transition-opacity duration-300">
            {copyFeedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReport;