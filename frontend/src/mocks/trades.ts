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

export const mockTrades: Trade[] = [
  {
    id: 'TXN001',
    symbol: 'KCB',
    name: 'KCB Group PLC',
    side: 'buy',
    quantity: 10,
    price: 32.5,
    total: 325.0,
    fee: 0.39,
    status: 'executed',
    orderType: 'market',
    executedAt: '2024-10-09 14:30',
  },
  {
    id: 'TXN002',
    symbol: 'SCOM',
    name: 'Safaricom PLC',
    side: 'sell',
    quantity: 20,
    price: 46.0,
    total: 920.0,
    fee: 1.10,
    status: 'executed',
    orderType: 'limit',
    executedAt: '2024-10-08 16:45',
  },
  {
    id: 'TXN003',
    symbol: 'EQTY',
    name: 'Equity Group Holdings',
    side: 'buy',
    quantity: 30,
    price: 48.67,
    total: 1460.1,
    fee: 1.75,
    status: 'executed',
    orderType: 'market',
    executedAt: '2024-10-06 11:20',
  },
  {
    id: 'TXN004',
    symbol: 'EABL',
    name: 'East African Breweries',
    side: 'buy',
    quantity: 20,
    price: 185.5,
    total: 3710.0,
    fee: 4.45,
    status: 'executed',
    orderType: 'limit',
    executedAt: '2024-10-03 13:45',
  },
  {
    id: 'TXN005',
    symbol: 'KCB',
    name: 'KCB Group PLC',
    side: 'buy',
    quantity: 20,
    price: 32.5,
    total: 650.0,
    fee: 0.78,
    status: 'pending',
    orderType: 'limit',
    executedAt: '2024-10-02 10:00',
  },
  {
    id: 'TXN006',
    symbol: 'COOP',
    name: 'Co-operative Bank',
    side: 'buy',
    quantity: 100,
    price: 14.2,
    total: 1420.0,
    fee: 1.70,
    status: 'executed',
    orderType: 'market',
    executedAt: '2024-09-28 09:15',
  },
  {
    id: 'TXN007',
    symbol: 'BAMB',
    name: 'Bamburi Cement',
    side: 'sell',
    quantity: 50,
    price: 28.5,
    total: 1425.0,
    fee: 1.71,
    status: 'cancelled',
    orderType: 'limit',
    executedAt: '2024-09-25 15:30',
  },
  {
    id: 'TXN008',
    symbol: 'ABSA',
    name: 'Absa Bank Kenya',
    side: 'buy',
    quantity: 150,
    price: 11.85,
    total: 1777.5,
    fee: 2.13,
    status: 'executed',
    orderType: 'market',
    executedAt: '2024-09-20 10:45',
  },
];