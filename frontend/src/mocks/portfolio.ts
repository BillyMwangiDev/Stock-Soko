export interface Position {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalGain: number;
  totalGainPercent: number;
  cashBalance: number;
}

export const mockPositions: Position[] = [
  {
    symbol: 'SCOM',
    name: 'Safaricom PLC',
    quantity: 100,
    avgPrice: 40.5,
    currentPrice: 43.5,
    marketValue: 4350.0,
    unrealizedPL: 300.0,
    unrealizedPLPercent: 7.41,
    dayChange: 120.0,
    dayChangePercent: 2.84,
  },
  {
    symbol: 'KCB',
    name: 'KCB Group PLC',
    quantity: 50,
    avgPrice: 33.0,
    currentPrice: 32.5,
    marketValue: 1625.0,
    unrealizedPL: -25.0,
    unrealizedPLPercent: -1.52,
    dayChange: -25.0,
    dayChangePercent: -1.52,
  },
  {
    symbol: 'EQTY',
    name: 'Equity Group Holdings',
    quantity: 80,
    avgPrice: 46.0,
    currentPrice: 48.8,
    marketValue: 3904.0,
    unrealizedPL: 224.0,
    unrealizedPLPercent: 6.09,
    dayChange: 184.0,
    dayChangePercent: 4.95,
  },
  {
    symbol: 'EABL',
    name: 'East African Breweries',
    quantity: 20,
    avgPrice: 182.0,
    currentPrice: 185.5,
    marketValue: 3710.0,
    unrealizedPL: 70.0,
    unrealizedPLPercent: 1.92,
    dayChange: 70.0,
    dayChangePercent: 1.92,
  },
];

export const mockPortfolioSummary: PortfolioSummary = {
  totalValue: 18589.0,
  dayChange: 349.0,
  dayChangePercent: 1.91,
  totalGain: 569.0,
  totalGainPercent: 3.16,
  cashBalance: 5000.0,
};

export interface AIRecommendation {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  targetPrice?: number;
  timeframe?: string;
}

export const mockRecommendations: AIRecommendation[] = [
  {
    symbol: 'SCOM',
    action: 'buy',
    confidence: 85,
    reasoning: 'Strong quarterly earnings and positive market sentiment. Technical indicators show bullish trend.',
    targetPrice: 48.0,
    timeframe: '3-6 months',
  },
  {
    symbol: 'EQTY',
    action: 'hold',
    confidence: 72,
    reasoning: 'Stable performance with dividend yield. Current price near fair value, best to hold.',
    targetPrice: 50.0,
    timeframe: '6-12 months',
  },
  {
    symbol: 'KCB',
    action: 'buy',
    confidence: 78,
    reasoning: 'Undervalued compared to sector peers. Regional expansion plans show growth potential.',
    targetPrice: 38.0,
    timeframe: '6-12 months',
  },
];