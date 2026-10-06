export function fmt(n: number, decimals = 0): string {
  if (Number.isNaN(n)) return '0';
  return Number(n).toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPrecise(n: number): string {
  if (Number.isNaN(n)) return '0';
  if (Number.isInteger(n)) return n.toLocaleString('th-TH');
  return Number(n).toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function numForInput(n: number): number | '' {
  if (Number.isNaN(n) || n <= 0) return '';
  return Math.round(n * 100) / 100;
}

export function inputDisplayValue(n: number | ''): string {
  return n === '' ? '' : String(n);
}
