export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'buy' | 'sell' | 'dividend' | 'fee';
  amount: number;
  currency: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  symbol?: string;
  quantity?: number;
  price?: number;
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    amount: -325.0,
    currency: 'KES',
    description: 'Bought 10 shares of KCB',
    timestamp: '2024-10-09 14:30',
    status: 'completed',
    reference: 'TXN001',
    symbol: 'KCB',
    quantity: 10,
    price: 32.5,
  },
  {
    id: '2',
    type: 'deposit',
    amount: 5000.0,
    currency: 'KES',
    description: 'M-Pesa Deposit',
    timestamp: '2024-10-09 10:15',
    status: 'completed',
    reference: 'MPESA-RKJ7G8H9',
  },
  {
    id: '3',
    type: 'sell',
    amount: 920.0,
    currency: 'KES',
    description: 'Sold 20 shares of SCOM',
    timestamp: '2024-10-08 16:45',
    status: 'completed',
    reference: 'TXN002',
    symbol: 'SCOM',
    quantity: 20,
    price: 46.0,
  },
  {
    id: '4',
    type: 'dividend',
    amount: 140.0,
    currency: 'KES',
    description: 'Dividend from SCOM (100 shares @ KES 1.40)',
    timestamp: '2024-10-07 09:00',
    status: 'completed',
    reference: 'DIV001',
    symbol: 'SCOM',
  },
  {
    id: '5',
    type: 'buy',
    amount: -1460.0,
    currency: 'KES',
    description: 'Bought 30 shares of EQTY',
    timestamp: '2024-10-06 11:20',
    status: 'completed',
    reference: 'TXN003',
    symbol: 'EQTY',
    quantity: 30,
    price: 48.67,
  },
  {
    id: '6',
    type: 'fee',
    amount: -25.0,
    currency: 'KES',
    description: 'Transaction Fee',
    timestamp: '2024-10-06 11:20',
    status: 'completed',
    reference: 'FEE001',
  },
  {
    id: '7',
    type: 'withdrawal',
    amount: -2000.0,
    currency: 'KES',
    description: 'M-Pesa Withdrawal',
    timestamp: '2024-10-05 15:30',
    status: 'completed',
    reference: 'MPESA-WKL4M2N6',
  },
  {
    id: '8',
    type: 'deposit',
    amount: 10000.0,
    currency: 'KES',
    description: 'M-Pesa Deposit',
    timestamp: '2024-10-04 08:00',
    status: 'completed',
    reference: 'MPESA-RHJ9K5L3',
  },
  {
    id: '9',
    type: 'buy',
    amount: -3710.0,
    currency: 'KES',
    description: 'Bought 20 shares of EABL',
    timestamp: '2024-10-03 13:45',
    status: 'completed',
    reference: 'TXN004',
    symbol: 'EABL',
    quantity: 20,
    price: 185.5,
  },
  {
    id: '10',
    type: 'buy',
    amount: -650.0,
    currency: 'KES',
    description: 'Bought 20 shares of KCB',
    timestamp: '2024-10-02 10:00',
    status: 'pending',
    reference: 'TXN005',
    symbol: 'KCB',
    quantity: 20,
    price: 32.5,
  },
];