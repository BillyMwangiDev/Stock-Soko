export interface TaxableEvent {
  id: string;
  date: string;
  symbol: string;
  type: 'capital_gain' | 'capital_loss' | 'dividend';
  description: string;
  amount: number;
  tax: number;
}

export interface TaxSummary {
  year: number;
  method: 'fifo' | 'lifo' | 'average';
  totalCapitalGains: number;
  totalCapitalLosses: number;
  totalDividends: number;
  totalTaxLiability: number;
}

export const mockTaxableEvents: TaxableEvent[] = [
  {
    id: '1',
    date: '2025-09-15',
    symbol: 'EQTY',
    type: 'capital_gain',
    description: 'Sold 30 shares of EQTY at profit',
    amount: 1200.0,
    tax: 60.0,
  },
  {
    id: '2',
    date: '2025-08-20',
    symbol: 'KCB',
    type: 'capital_gain',
    description: 'Sold 20 shares of KCB at profit',
    amount: 850.5,
    tax: 42.53,
  },
  {
    id: '3',
    date: '2025-07-10',
    symbol: 'SCOM',
    type: 'dividend',
    description: 'Dividend payment',
    amount: 320.0,
    tax: 16.0,
  },
  {
    id: '4',
    date: '2025-06-05',
    symbol: 'EABL',
    type: 'dividend',
    description: 'Dividend payment',
    amount: 180.0,
    tax: 9.0,
  },
  {
    id: '5',
    date: '2025-05-15',
    symbol: 'BAMB',
    type: 'capital_loss',
    description: 'Sold 50 shares of BAMB at loss',
    amount: -450.0,
    tax: 0.0,
  },
  {
    id: '6',
    date: '2025-04-10',
    symbol: 'COOP',
    type: 'capital_gain',
    description: 'Sold 100 shares of COOP at profit',
    amount: 520.0,
    tax: 26.0,
  },
];

export const mockTaxSummary: TaxSummary = {
  year: 2025,
  method: 'fifo',
  totalCapitalGains: 2570.5,
  totalCapitalLosses: 450.0,
  totalDividends: 500.0,
  totalTaxLiability: 153.53,
};