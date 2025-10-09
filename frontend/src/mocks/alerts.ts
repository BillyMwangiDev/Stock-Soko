export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  currentPrice: number;
  condition: 'above' | 'below';
  active: boolean;
  createdAt: string;
}

export const mockAlerts: PriceAlert[] = [
  {
    id: '1',
    symbol: 'SCOM',
    targetPrice: 45.0,
    currentPrice: 43.5,
    condition: 'above',
    active: true,
    createdAt: '2024-10-05',
  },
  {
    id: '2',
    symbol: 'KCB',
    targetPrice: 30.0,
    currentPrice: 32.5,
    condition: 'below',
    active: true,
    createdAt: '2024-10-04',
  },
  {
    id: '3',
    symbol: 'EQTY',
    targetPrice: 50.0,
    currentPrice: 48.8,
    condition: 'above',
    active: false,
    createdAt: '2024-10-01',
  },
  {
    id: '4',
    symbol: 'EABL',
    targetPrice: 180.0,
    currentPrice: 185.5,
    condition: 'below',
    active: true,
    createdAt: '2024-10-03',
  },
];