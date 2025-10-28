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

// Portfolio aligned with backend stock prices for consistency
export const mockPositions: Position[] = [
  {
    symbol: 'SCOM',
    name: 'Safaricom PLC',
    quantity: 200,
    avgPrice: 26.00,             // Bought at 26.00
    currentPrice: 28.50,         // Current: 28.50 (from backend)
    marketValue: 5700.00,        // 200 × 28.50
    unrealizedPL: 500.00,        // (28.50 - 26.00) × 200
    unrealizedPLPercent: 9.62,   // (500 / 5200) × 100
    dayChange: 170.00,           // 0.85 change × 200
    dayChangePercent: 3.07,      // From backend
  },
  {
    symbol: 'EQTY',
    name: 'Equity Group Holdings',
    quantity: 100,
    avgPrice: 43.00,             // Bought at 43.00
    currentPrice: 45.80,         // Current: 45.80
    marketValue: 4580.00,        // 100 × 45.80
    unrealizedPL: 280.00,        // (45.80 - 43.00) × 100
    unrealizedPLPercent: 6.51,   // (280 / 4300) × 100
    dayChange: 120.00,           // 1.20 change × 100
    dayChangePercent: 2.69,      // From backend
  },
  {
    symbol: 'KCB',
    name: 'KCB Group',
    quantity: 150,
    avgPrice: 40.00,             // Bought at 40.00
    currentPrice: 38.25,         // Current: 38.25
    marketValue: 5737.50,        // 150 × 38.25
    unrealizedPL: -262.50,       // (38.25 - 40.00) × 150
    unrealizedPLPercent: -4.38,  // (-262.50 / 6000) × 100
    dayChange: -75.00,           // -0.50 change × 150
    dayChangePercent: -1.29,     // From backend
  },
  {
    symbol: 'COOP',
    name: 'Co-operative Bank',
    quantity: 300,
    avgPrice: 15.50,             // Bought at 15.50
    currentPrice: 16.45,         // Current: 16.45
    marketValue: 4935.00,        // 300 × 16.45
    unrealizedPL: 285.00,        // (16.45 - 15.50) × 300
    unrealizedPLPercent: 6.13,   // (285 / 4650) × 100
    dayChange: 105.00,           // 0.35 change × 300
    dayChangePercent: 2.17,      // From backend
  },
  {
    symbol: 'EABL',
    name: 'East African Breweries',
    quantity: 25,
    avgPrice: 180.00,            // Bought at 180.00
    currentPrice: 185.00,        // Current: 185.00
    marketValue: 4625.00,        // 25 × 185.00
    unrealizedPL: 125.00,        // (185.00 - 180.00) × 25
    unrealizedPLPercent: 2.78,   // (125 / 4500) × 100
    dayChange: 62.50,            // 2.50 change × 25
    dayChangePercent: 1.37,      // From backend
  },
  {
    symbol: 'NCBA',
    name: 'NCBA Group',
    quantity: 120,
    avgPrice: 41.00,             // Bought at 41.00
    currentPrice: 42.50,         // Current: 42.50
    marketValue: 5100.00,        // 120 × 42.50
    unrealizedPL: 180.00,        // (42.50 - 41.00) × 120
    unrealizedPLPercent: 3.66,   // (180 / 4920) × 100
    dayChange: 60.00,            // 0.50 change × 120
    dayChangePercent: 1.19,      // From backend
  },
];

// Calculate totals from positions
const totalMarketValue = mockPositions.reduce((sum, pos) => sum + pos.marketValue, 0); // 30,677.50
const totalPL = mockPositions.reduce((sum, pos) => sum + pos.unrealizedPL, 0);         // 1,107.50
const totalDayChange = mockPositions.reduce((sum, pos) => sum + pos.dayChange, 0);    // 442.50
const totalCostBasis = totalMarketValue - totalPL;                                      // 29,570.00

export const mockPortfolioSummary: PortfolioSummary = {
  totalValue: 60000.00,          // Total = Cash + Holdings
  dayChange: 442.50,             // Sum of all day changes
  dayChangePercent: 1.46,        // (442.50 / 30235) × 100
  totalGain: 1107.50,            // Sum of all unrealized PL
  totalGainPercent: 3.75,        // (1107.50 / 29570) × 100
  cashBalance: 29322.50,         // Remaining cash after investments
};

export interface AIRecommendation {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  targetPrice?: number;
  timeframe?: string;
}

// AI Recommendations aligned with backend data
export const mockRecommendations: AIRecommendation[] = [
  {
    symbol: 'SCOM',
    action: 'buy',
    confidence: 85,
    reasoning: 'Dominant market position with 65%+ market share. Strong dividend history and expanding M-Pesa ecosystem. 5G rollout presents growth opportunity.',
    targetPrice: 32.50,
    timeframe: '6-12 months',
  },
  {
    symbol: 'EQTY',
    action: 'buy',
    confidence: 82,
    reasoning: 'Leading regional bank with strong digital banking growth. Aggressive expansion in East Africa. Undervalued P/E ratio compared to peers.',
    targetPrice: 52.00,
    timeframe: '6-12 months',
  },
  {
    symbol: 'KCB',
    action: 'hold',
    confidence: 68,
    reasoning: 'Stable dividend payer but facing increased competition. Recent NBK acquisition integration ongoing. Attractive valuation but growth concerns.',
    targetPrice: 40.00,
    timeframe: '12 months',
  },
  {
    symbol: 'COOP',
    action: 'buy',
    confidence: 75,
    reasoning: 'Strong SME and agricultural sector exposure. Growing digital channels. Cooperative model provides stable deposit base.',
    targetPrice: 18.50,
    timeframe: '6-12 months',
  },
  {
    symbol: 'NCBA',
    action: 'buy',
    confidence: 83,
    reasoning: 'NIC-CBA merger synergies delivering. Strong digital banking platform. Undervalued P/E ratio. Growing regional presence. Momentum building.',
    targetPrice: 48.00,
    timeframe: '6-12 months',
  },
];
