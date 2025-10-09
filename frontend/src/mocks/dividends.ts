export interface Dividend {
  id: string;
  stockTicker: string;
  stockName: string;
  amount: number;
  exDividendDate: string;
  paymentDate: string;
  recordDate: string;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  yield: number;
  status: 'upcoming' | 'declared' | 'paid';
}

export interface DividendPayment {
  id: string;
  stockTicker: string;
  stockName: string;
  shares: number;
  amountPerShare: number;
  totalAmount: number;
  paymentDate: string;
  status: 'pending' | 'paid';
}

export const mockDividends: Dividend[] = [
  {
    id: '1',
    stockTicker: 'SCOM',
    stockName: 'Safaricom PLC',
    amount: 1.40,
    exDividendDate: '2025-11-15',
    paymentDate: '2025-12-01',
    recordDate: '2025-11-20',
    frequency: 'annual',
    yield: 3.22,
    status: 'declared',
  },
  {
    id: '2',
    stockTicker: 'KCB',
    stockName: 'KCB Group PLC',
    amount: 1.50,
    exDividendDate: '2025-10-20',
    paymentDate: '2025-11-05',
    recordDate: '2025-10-25',
    frequency: 'annual',
    yield: 4.62,
    status: 'upcoming',
  },
  {
    id: '3',
    stockTicker: 'EQTY',
    stockName: 'Equity Group Holdings',
    amount: 2.50,
    exDividendDate: '2025-12-01',
    paymentDate: '2025-12-20',
    recordDate: '2025-12-05',
    frequency: 'annual',
    yield: 5.12,
    status: 'declared',
  },
  {
    id: '4',
    stockTicker: 'EABL',
    stockName: 'East African Breweries',
    amount: 8.00,
    exDividendDate: '2025-09-10',
    paymentDate: '2025-09-25',
    recordDate: '2025-09-15',
    frequency: 'semi-annual',
    yield: 4.32,
    status: 'paid',
  },
  {
    id: '5',
    stockTicker: 'COOP',
    stockName: 'Co-operative Bank',
    amount: 0.80,
    exDividendDate: '2025-08-15',
    paymentDate: '2025-09-01',
    recordDate: '2025-08-20',
    frequency: 'annual',
    yield: 5.63,
    status: 'paid',
  },
  {
    id: '6',
    stockTicker: 'BAT',
    stockName: 'British American Tobacco',
    amount: 29.00,
    exDividendDate: '2025-07-20',
    paymentDate: '2025-08-10',
    recordDate: '2025-07-25',
    frequency: 'semi-annual',
    yield: 6.82,
    status: 'paid',
  },
];

export const mockDividendPayments: DividendPayment[] = [
  {
    id: '1',
    stockTicker: 'SCOM',
    stockName: 'Safaricom PLC',
    shares: 100,
    amountPerShare: 1.40,
    totalAmount: 140.0,
    paymentDate: '2025-12-01',
    status: 'pending',
  },
  {
    id: '2',
    stockTicker: 'KCB',
    stockName: 'KCB Group PLC',
    shares: 50,
    amountPerShare: 1.50,
    totalAmount: 75.0,
    paymentDate: '2025-11-05',
    status: 'pending',
  },
  {
    id: '3',
    stockTicker: 'EQTY',
    stockName: 'Equity Group Holdings',
    shares: 80,
    amountPerShare: 2.50,
    totalAmount: 200.0,
    paymentDate: '2025-12-20',
    status: 'pending',
  },
  {
    id: '4',
    stockTicker: 'EABL',
    stockName: 'East African Breweries',
    shares: 20,
    amountPerShare: 8.00,
    totalAmount: 160.0,
    paymentDate: '2025-09-25',
    status: 'paid',
  },
  {
    id: '5',
    stockTicker: 'COOP',
    stockName: 'Co-operative Bank',
    shares: 100,
    amountPerShare: 0.80,
    totalAmount: 80.0,
    paymentDate: '2025-09-01',
    status: 'paid',
  },
  {
    id: '6',
    stockTicker: 'BAT',
    stockName: 'British American Tobacco',
    shares: 10,
    amountPerShare: 29.00,
    totalAmount: 290.0,
    paymentDate: '2025-08-10',
    status: 'paid',
  },
  {
    id: '7',
    stockTicker: 'SCOM',
    stockName: 'Safaricom PLC',
    shares: 100,
    amountPerShare: 1.35,
    totalAmount: 135.0,
    paymentDate: '2024-12-01',
    status: 'paid',
  },
];

