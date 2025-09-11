export const formatCurrency = (amount: number | string, currency: string = 'IDR'): string => {
  const numAmount = Number(amount);
  
  // Handle invalid numbers
  if (isNaN(numAmount) || !isFinite(numAmount)) {
    return 'Rp 0';
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numAmount);
};

export const hexToRgba = (hex: string, alpha: number = 0.1): string => {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return `rgba(100, 116, 139, ${alpha})`;
  }
  
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  
  const color = '0x' + c.join('');
  const r = (parseInt(color) >> 16) & 255;
  const g = (parseInt(color) >> 8) & 255;
  const b = parseInt(color) & 255;
  
  return `rgba(${r},${g},${b},${alpha})`;
};

export const adjustColor = (hex: string, percent: number): string => {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = parseInt((R * (100 + percent) / 100).toString());
  G = parseInt((G * (100 + percent) / 100).toString());
  B = parseInt((B * (100 + percent) / 100).toString());

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  const RR = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
};