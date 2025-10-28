export interface Trade {
  id: string;
  symbol: string;
  name: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  fee: number;
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
  orderType: 'market' | 'limit';
  executedAt: string;
}

// Trades aligned with portfolio positions and current stock prices
export const mockTrades: Trade[] = [
  // SCOM - Total 200 shares bought
  {
    id: 'TXN001',
    symbol: 'SCOM',
    name: 'Safaricom PLC',
    side: 'buy',
    quantity: 150,
    price: 26.00,
    total: 3900.00,
    fee: 4.68,
    status: 'executed',
    orderType: 'market',
    executedAt: '2024-09-15 10:30',
  },
  {
    id: 'TXN002',
    symbol: 'SCOM',
    name: 'Safaricom PLC',
    side: 'buy',
    quantity: 50,
    price: 26.00,
    total: 1300.00,
    fee: 1.56,
    status: 'executed',
    orderType: 'limit',
    executedAt: '2024-09-20 14:15',
  },
  
  // EQTY - Total 100 shares bought
  {
    id: 'TXN003',
    symbol: 'EQTY',
    name: 'Equity Group Holdings',
    side: 'buy',
    quantity: 100,
    price: 43.00,
    total: 4300.00,
    fee: 5.16,
    status: 'executed',
    orderType: 'market',
    executedAt: '2024-09-22 11:45',
  },
  
  // KCB - Total 150 shares bought
  {
    id: 'TXN004',
    symbol: 'KCB',
    name: 'KCB Group',
    side: 'buy',
    quantity: 100,
    price: 40.00,
    total: 4000.00,
    fee: 4.80,
    status: 'executed',
    orderType: 'limit',
    executedAt: '2024-09-18 09:20',
  },
  {
    id: 'TXN005',
    symbol: 'KCB',
    name: 'KCB Group',
    side: 'buy',
    quantity: 50,
    price: 40.00,
    total: 2000.00,
    fee: 2.40,
    status: 'executed',
    orderType: 'market',
    executedAt: '2024-09-25 15:30',
  },
  
  // COOP - Total 300 shares bought
  {
    id: 'TXN006',
    symbol: 'COOP',
    name: 'Co-operative Bank',
    side: 'buy',
    quantity: 200,
    price: 15.50,
    total: 3100.00,
    fee: 3.72,
    status: 'executed',
    orderType: 'market',
    executedAt: '2024-09-28 10:15',
  },
  {
    id: 'TXN007',
    symbol: 'COOP',
    name: 'Co-operative Bank',
    side: 'buy',
    quantity: 100,
    price: 15.50,
    total: 1550.00,
    fee: 1.86,
    status: 'executed',
    orderType: 'limit',
    executedAt: '2024-10-01 13:45',
  },
  
  // EABL - Total 25 shares bought
  {
    id: 'TXN008',
    symbol: 'EABL',
    name: 'East African Breweries',
    side: 'buy',
    quantity: 25,
    price: 180.00,
    total: 4500.00,
    fee: 5.40,
    status: 'executed',
    orderType: 'market',
    executedAt: '2024-10-03 11:20',
  },
  
  // NCBA - Total 120 shares bought
  {
    id: 'TXN009',
    symbol: 'NCBA',
    name: 'NCBA Group',
    side: 'buy',
    quantity: 80,
    price: 41.00,
    total: 3280.00,
    fee: 3.94,
    status: 'executed',
    orderType: 'limit',
    executedAt: '2024-10-05 14:30',
  },
  {
    id: 'TXN010',
    symbol: 'NCBA',
    name: 'NCBA Group',
    side: 'buy',
    quantity: 40,
    price: 41.00,
    total: 1640.00,
    fee: 1.97,
    status: 'executed',
    orderType: 'market',
    executedAt: '2024-10-08 10:45',
  },
  
  // Recent pending/cancelled orders
  {
    id: 'TXN011',
    symbol: 'ABSA',
    name: 'Absa Bank Kenya',
    side: 'buy',
    quantity: 100,
    price: 14.00,
    total: 1400.00,
    fee: 1.68,
    status: 'pending',
    orderType: 'limit',
    executedAt: '2024-10-09 09:30',
  },
  {
    id: 'TXN012',
    symbol: 'BAMB',
    name: 'Bamburi Cement',
    side: 'buy',
    quantity: 50,
    price: 30.00,
    total: 1500.00,
    fee: 1.80,
    status: 'cancelled',
    orderType: 'limit',
    executedAt: '2024-10-07 16:00',
  },
  {
    id: 'TXN013',
    symbol: 'DTBK',
    name: 'Diamond Trust Bank Kenya',
    side: 'sell',
    quantity: 30,
    price: 62.50,
    total: 1875.00,
    fee: 2.25,
    status: 'executed',
    orderType: 'market',
    executedAt: '2024-09-12 14:20',
  },
];
