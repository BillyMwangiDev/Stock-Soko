import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { Card } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import { hapticFeedback } from '../utils/haptics';

type LessonDetailScreenProp = StackNavigationProp<ProfileStackParamList, 'LessonDetail'>;
type LessonDetailRouteProp = RouteProp<ProfileStackParamList, 'LessonDetail'>;

interface Props {
  navigation: LessonDetailScreenProp;
  route: LessonDetailRouteProp;
}

const LESSON_DATA: Record<string, any> = {
  '1': {
    sections: [
      {
        title: 'What is a Stock?',
        content: 'A stock represents ownership in a company. When you buy shares of KCB, you become a part-owner of Kenya Commercial Bank. As the company grows and becomes more profitable, the value of your shares typically increases.',
        keyPoints: [
          'Stock = Ownership in a company',
          'Share price changes based on supply and demand',
          'You make money through price appreciation and dividends'
        ],
        examples: [
          'If you buy 100 shares of KCB at KES 32, you own 100/total_shares of the entire company',
          'If KCB price rises to KES 40, your 100 shares are now worth KES 4,000 (profit of KES 800)'
        ]
      },
      {
        title: 'How Stock Prices Move',
        content: 'Stock prices are determined by supply (sellers) and demand (buyers). When more people want to buy a stock than sell it, the price goes up. When more people want to sell than buy, the price goes down.',
        keyPoints: [
          'Supply and demand drive prices',
          'Good news = more buyers = price up',
          'Bad news = more sellers = price down',
          'Market can be emotional and overreact'
        ],
        examples: [
          'Safaricom announces record profits - Price jumps 10% as everyone wants to buy',
          'Banking sector faces bad loans crisis - Prices fall 20% as investors panic sell'
        ]
      }
    ],
    quiz: [
      {
        question: 'What does buying a stock mean?',
        options: [
          'Lending money to a company',
          'Becoming a part-owner of the company',
          'Betting on price movement',
          'Giving money to the CEO'
        ],
        correct: 1
      },
      {
        question: 'What makes a stock price go up?',
        options: [
          'The CEO wants it to',
          'More sellers than buyers',
          'More buyers than sellers',
          'Random chance'
        ],
        correct: 2
      }
    ]
  },
  '2': {
    sections: [
      {
        title: 'Understanding Market Trends',
        content: 'A trend is the general direction in which a stock or market is moving. Trends can be upward (bullish), downward (bearish), or sideways (neutral).',
        keyPoints: [
          'Uptrend: Series of higher highs and higher lows',
          'Downtrend: Series of lower highs and lower lows',
          'Sideways: Price moves in a range',
          'Trend is your friend - trade with the trend'
        ],
        examples: [
          'NSE 20 Index rising for 6 months = Bull market',
          'Banking sector falling for 3 months = Sector downtrend',
          'Stock bouncing between KES 30-35 = Sideways/Range-bound'
        ]
      }
    ],
    quiz: []
  },
  '3': {
    sections: [
      {
        title: 'Reading Stock Charts',
        content: 'Stock charts visualize price movements over time. The most common chart is the candlestick chart.',
        keyPoints: [
          'Green candle = Price closed higher (bullish)',
          'Red candle = Price closed lower (bearish)',
          'Long body = Strong momentum',
          'Small body = Indecision'
        ]
      }
    ],
    quiz: []
  },
  '4': {
    sections: [
      {
        title: 'Technical Analysis',
        content: 'Technical analysis uses price and volume data to identify patterns. Key tools include moving averages, RSI, and MACD.',
        formulas: [
          {
            name: 'RSI',
            formula: 'RSI = 100 - (100 / (1 + RS))',
            example: 'RSI < 30 = Oversold, RSI > 70 = Overbought'
          }
        ]
      }
    ],
    quiz: []
  },
  '5': {
    sections: [
      {
        title: 'Portfolio Diversification',
        content: 'Never put all your eggs in one basket. Diversification spreads risk across multiple stocks and sectors.',
        keyPoints: [
          'Invest in 8-15 different stocks',
          'Spread across 3-5 sectors',
          'Maximum 10% in one stock',
          'Keep 10-15% cash'
        ]
      }
    ],
    quiz: []
  },
  '6': {
    sections: [
      {
        title: 'AI-Powered Trading',
        content: 'AI can analyze vast amounts of data to identify patterns humans might miss.',
        keyPoints: [
          'AI analyzes 100s of stocks simultaneously',
          'Combines fundamental + technical + sentiment',
          'Provides confidence scores',
          'Always verify with your own research'
        ]
      }
    ],
    quiz: []
  },
  '7': {
    sections: [
      {
        title: 'Risk Management',
        content: 'Protecting your capital is more important than making profits. Never risk more than 1-2% per trade.',
        formulas: [
          {
            name: 'Position Size',
            formula: 'Shares = (Portfolio × Risk%) / (Entry - Stop)',
            example: 'Portfolio KES 100K, 1% risk, Entry KES 50, Stop KES 45 = 200 shares'
          }
        ]
      }
    ],
    quiz: []
  },
  '8': {
    sections: [
      {
        title: 'What is Value Investing?',
        content: 'Value investing is buying stocks that trade below their true worth (intrinsic value) and holding them for long-term gains. Think of it as buying a KES 100 note for KES 60. Founded by Benjamin Graham and popularized by Warren Buffett, this approach focuses on business fundamentals, not market emotions.',
        keyPoints: [
          'Value vs Price: Price is what you pay, value is what you get',
          'Mr. Market concept: Market emotions create opportunities for patient investors',
          'Long-term mindset: Hold for 3-5 years minimum to realize value',
          'Margin of Safety: Your protection against mistakes and bad luck'
        ],
        examples: [
          'If KCB is worth KES 100 based on assets and earnings but trades at KES 60, that is a value opportunity',
          'During the 2016 banking crisis, quality banks sold at P/E of 5-6 when their normal P/E was 10-12',
          'Investors who bought Safaricom during COVID crash at KES 18 and held saw it recover to KES 35+'
        ]
      },
      {
        title: 'Core Principles',
        content: 'Value investing is built on four fundamental principles that guide all investment decisions.',
        keyPoints: [
          'Buy stocks trading below intrinsic value',
          'Focus on business fundamentals, not market prices',
          'Patient approach: wait for the right price',
          'Think like a business owner, not a trader'
        ],
        examples: [
          'Business owner mindset: Would you buy this entire company at current price?',
          'Patience pays: NSE value stocks can take 2-5 years to be recognized',
          'Fundamentals matter: Strong balance sheet + consistent earnings = quality investment'
        ]
      }
    ],
    quiz: [
      {
        question: 'What is value investing?',
        options: [
          'Buying cheap stocks that will never rise',
          'Buying stocks below their intrinsic value for long-term gains',
          'Day trading based on price movements',
          'Following hot stock tips'
        ],
        correct: 1
      },
      {
        question: 'What is the recommended minimum holding period for value stocks?',
        options: [
          '1 month',
          '6 months',
          '3-5 years',
          '10+ years'
        ],
        correct: 2
      }
    ]
  },
  '9': {
    sections: [
      {
        title: 'Margin of Safety - Your Most Important Concept',
        content: 'Margin of Safety is the difference between a stock intrinsic value and its market price. It is your protection against errors in valuation, unexpected bad news, and market volatility. Benjamin Graham considered this the cornerstone of value investing.',
        formulas: [
          {
            name: 'Margin of Safety',
            formula: 'MOS = ((Intrinsic Value - Market Price) / Intrinsic Value) × 100%',
            example: 'Intrinsic Value KES 100, Price KES 70 → MOS = 30%'
          }
        ],
        keyPoints: [
          'MOS protects against valuation errors and unforeseen problems',
          'Minimum 30% for stable large caps (KCB, Safaricom, EABL)',
          'Require 40-50% for volatile or smaller NSE companies',
          'NSE requires higher MOS than developed markets due to higher volatility'
        ]
      },
      {
        title: 'Practical Application',
        content: 'Calculating and using Margin of Safety in real NSE stock analysis.',
        examples: [
          'Example Bank: Intrinsic Value KES 150, Current Price KES 95 → MOS = (150-95)/150 = 36.7% → GOOD',
          'Example Manufacturer: Intrinsic Value KES 80, Current Price KES 75 → MOS = 6.25% → TOO RISKY',
          'Small Cap Stock: Intrinsic Value KES 50, Current Price KES 28 → MOS = 44% → ACCEPTABLE for small cap'
        ],
        keyPoints: [
          'Higher MOS = Lower risk, but harder to find',
          'Wait patiently for your required MOS before buying',
          'MOS allows for mistakes: even if intrinsic value 20% off, still protected',
          'During market crashes, MOS opportunities increase significantly'
        ]
      }
    ],
    quiz: [
      {
        question: 'What is the minimum Margin of Safety for stable NSE large caps?',
        options: [
          '10%',
          '20%',
          '30%',
          '50%'
        ],
        correct: 2
      }
    ]
  },
  '10': {
    sections: [
      {
        title: 'Simple Valuation - Is It Cheap?',
        content: 'Easy methods to quickly determine if a stock is undervalued using two key ratios: Price-to-Earnings (P/E) and Price-to-Book (P/B).',
        keyPoints: [
          'P/E Ratio: How many years to earn back investment',
          'P/B Ratio: Paying above or below book value',
          'Compare to history and peers',
          'Red flags to watch for'
        ]
      },
      {
        title: 'P/E Ratio Analysis',
        content: 'The Price-to-Earnings ratio shows how expensive a stock is relative to its earnings.',
        formulas: [
          {
            name: 'P/E Ratio',
            formula: 'P/E = Share Price / Earnings Per Share',
            example: 'Stock at KES 30, EPS KES 3 → P/E = 10x'
          }
        ],
        keyPoints: [
          'Bargain: P/E < 8 (compare to sector average)',
          'Reasonable: P/E 8-15 for NSE stocks',
          'Expensive: P/E > 15 (needs strong growth to justify)',
          'ALWAYS compare to company 5-year average and sector peers'
        ],
        examples: [
          'KCB at P/E 7 vs sector average 10 = potentially undervalued',
          'Manufacturing stock at P/E 12 vs its 10-year average of 15 = good value',
          'Low P/E can be a trap if earnings are falling'
        ]
      },
      {
        title: 'P/B Ratio Analysis',
        content: 'Price-to-Book ratio compares market price to book value (assets minus liabilities).',
        formulas: [
          {
            name: 'P/B Ratio',
            formula: 'P/B = Share Price / Book Value Per Share',
            example: 'Stock at KES 60, Book Value KES 50 → P/B = 1.2x'
          }
        ],
        keyPoints: [
          'Deep value: P/B < 1.0 (trading below book value)',
          'Fair: P/B 1.0-1.5',
          'Expensive: P/B > 2.0',
          'Especially useful for banks and asset-heavy companies'
        ],
        examples: [
          'Bank at P/B 0.9 = trading below asset value, potential value',
          'NSE banks typically trade at P/B 0.8-1.5',
          'High debt can distort book value - check debt levels'
        ]
      }
    ],
    quiz: [
      {
        question: 'What does P/E ratio measure?',
        options: [
          'Book value per share',
          'How many years to earn back investment',
          'Dividend yield',
          'Debt level'
        ],
        correct: 1
      }
    ]
  },
  '11': {
    sections: [
      {
        title: 'Economic Moats - Competitive Advantages',
        content: 'An economic moat is like a castle moat - it protects a company from competitors. Companies with wide moats can maintain high returns for decades. Warren Buffett prioritizes moats over everything else.',
        keyPoints: [
          'Moats protect profits from competition',
          'Wide moats = sustainable competitive advantage',
          'Narrow or no moat = temporary advantage',
          'Check if moat is durable (will it last 10+ years?)'
        ]
      },
      {
        title: 'Types of Moats in Kenya',
        content: 'Understanding the four main types of economic moats on the NSE.',
        keyPoints: [
          'Regulatory Licenses: Banking, telecom, insurance permits (KCB, Safaricom, Jubilee)',
          'Brand Dominance: Trusted brands with pricing power (EABL - Tusker, BAT)',
          'Distribution Networks: Extensive branch networks hard to replicate (Banks with 100+ branches)',
          'Scale Economies: Largest player with lowest costs (Bamburi Cement, Safaricom M-Pesa)'
        ],
        examples: [
          'Safaricom moat: Network effects (30M+ users), brand, regulatory license, scale',
          'KCB moat: 250+ branches, brand trust, banking license, customer switching costs',
          'EABL moat: Strong brands (Tusker, Guinness), distribution, customer loyalty'
        ]
      },
      {
        title: 'Assessing Moat Strength',
        content: 'Questions to ask when evaluating if a company has a durable competitive advantage.',
        keyPoints: [
          'Could a new competitor easily take market share?',
          'Does the company have pricing power?',
          'Are customers loyal or do they switch easily?',
          'How much would it cost to build this business from scratch?',
          'Will this advantage still exist in 10 years?'
        ]
      }
    ],
    quiz: []
  },
  '12': {
    sections: [
      {
        title: 'Understanding Business Models',
        content: 'Before investing, understand exactly how a company makes money. Warren Buffett rule: If you cannot explain the business to a 10-year-old, don not invest.',
        keyPoints: [
          'Revenue sources: where money comes from',
          'Cost structure: fixed vs variable costs',
          'Cash conversion: earnings to actual cash',
          'Business model simplicity: simple beats complex'
        ]
      },
      {
        title: 'NSE Business Models Explained',
        content: 'Breaking down how major NSE sectors make money.',
        keyPoints: [
          'Banks: Borrow at 5-8% (deposits), lend at 12-16% (loans). Keep the spread (Net Interest Margin).',
          'Manufacturing: Buy raw materials, add value, sell finished product. Scale reduces unit costs.',
          'Telecom: Airtime + Data + M-Pesa fees. Network effects - more users = more valuable.',
          'Insurance: Collect premiums, invest float, pay claims from investment returns.'
        ],
        examples: [
          'KCB: Collects deposits at 6%, lends at 13% = 7% spread. Also earns fees from M-Pesa, cards, transfers.',
          'EABL: Buys barley/hops, brews beer, sells to distributors. Volume matters - brewing 1M bottles cheaper per unit than 100K.',
          'Safaricom: 42M customers × KES 200/month ARPU = KES 8.4B monthly revenue. Add M-Pesa, data, and you have a money machine.'
        ]
      }
    ],
    quiz: []
  },
  '13': {
    sections: [
      {
        title: 'Intrinsic Value Calculation',
        content: 'Intrinsic value is what a business is truly worth, independent of market price. Multiple methods exist - use several and triangulate.',
        keyPoints: [
          'Asset-Based: Sum of assets minus liabilities (best for banks)',
          'Earnings Multiple: Normalized earnings × fair P/E',
          'Dividend Discount: Annual dividend / required return',
          'Owner Earnings: Buffett preferred method - cash owner can extract'
        ]
      },
      {
        title: 'Four Valuation Methods',
        content: 'Practical approaches to estimate intrinsic value on the NSE.',
        formulas: [
          {
            name: 'Asset-Based (Book Value)',
            formula: 'Value = Total Assets - Total Liabilities',
            example: 'Bank: KES 500B assets - KES 450B liabilities = KES 50B book value'
          },
          {
            name: 'Earnings Multiple',
            formula: 'Value = Normalized Earnings × Reasonable P/E',
            example: 'Company earns KES 10/share, sector P/E = 10 → Fair Value = KES 100'
          },
          {
            name: 'Dividend Discount (Simple)',
            formula: 'Value = Annual Dividend / Required Return',
            example: 'KES 4 dividend, 12% return → Value = 4/0.12 = KES 33'
          },
          {
            name: 'Owner Earnings',
            formula: 'Value = (Net Income + D&A - CapEx) × 10-15',
            example: 'Owner earnings KES 5B × 12 = KES 60B fair value'
          }
        ]
      },
      {
        title: 'NSE Conservative Assumptions',
        content: 'Being conservative in assumptions protects against over-optimism.',
        keyPoints: [
          'Growth rate: Use 5-10% for Kenya (lower than India/China)',
          'Discount rate: 15-20% to account for NSE volatility',
          'Terminal value: Be conservative - don\'t assume growth forever',
          'Cross-check: Use multiple methods and pick the most conservative estimate'
        ]
      }
    ],
    quiz: []
  },
  '14': {
    sections: [
      {
        title: 'Liquidity and Risk Analysis',
        content: 'A cheap stock is worthless if you cannot buy or sell it. Liquidity analysis ensures you can actually execute trades without moving the price.',
        keyPoints: [
          'Average Daily Volume: Can you buy without moving price?',
          'Bid-Ask Spread: Transaction cost on every trade',
          'Free Float: How much stock is available for trading?',
          'Illiquid stocks require higher margin of safety (40-50%)'
        ]
      },
      {
        title: 'Liquidity Metrics',
        content: 'Three key metrics to assess if a stock is liquid enough for your position.',
        formulas: [
          {
            name: 'Average Daily Volume',
            formula: 'Average of daily shares traded over 90 days',
            example: 'Minimum KES 500,000 daily turnover. Your position should be < 20% of daily volume.'
          },
          {
            name: 'Bid-Ask Spread',
            formula: '(Ask Price - Bid Price) / Bid Price × 100%',
            example: 'Bid KES 29.80, Ask KES 30.20 → Spread = 1.3% (acceptable)'
          },
          {
            name: 'Free Float',
            formula: 'Percentage of shares available for public trading',
            example: 'Benchmark: >20% for good liquidity. Low free float = harder to buy/sell.'
          }
        ],
        keyPoints: [
          'Excellent liquidity: >KES 1M daily, <1% spread, >30% free float',
          'Acceptable: >KES 500K daily, <2% spread, >20% free float',
          'Warning: <KES 500K daily, >5% spread, <20% free float'
        ]
      },
      {
        title: 'Risk Assessment Framework',
        content: 'Beyond liquidity, assess business, financial, management, and market risks.',
        keyPoints: [
          'Business risk: Can the industry be disrupted? (e.g., Fintech vs Banks)',
          'Financial risk: Debt/Equity >1.0 is concerning for most sectors',
          'Management risk: Check for related-party transactions, poor governance',
          'Market risk: Beta >1.5 means stock is 50% more volatile than market'
        ]
      }
    ],
    quiz: []
  },
  '15': {
    sections: [
      {
        title: 'Return on Equity - The Quality Metric',
        content: 'ROE measures how efficiently a company generates profit from shareholders\' equity. It is Warren Buffett favorite profitability metric.',
        formulas: [
          {
            name: 'ROE (Basic)',
            formula: 'ROE = (Net Income / Shareholders Equity) × 100%',
            example: 'Net Income KES 20B, Equity KES 100B → ROE = 20%'
          }
        ],
        keyPoints: [
          '>20% = Excellent (world-class business)',
          '15-20% = Good (above average)',
          '10-15% = Average (acceptable)',
          '<10% = Poor (capital not being used well)'
        ]
      },
      {
        title: 'DuPont Analysis - Understanding ROE Sources',
        content: 'Break ROE into three components to understand if high ROE comes from profits, efficiency, or debt.',
        formulas: [
          {
            name: 'DuPont 3-Factor',
            formula: 'ROE = Profit Margin × Asset Turnover × Equity Multiplier',
            example: '20% ROE could be from: 8% margin × 1.25 turnover × 2.0 leverage'
          }
        ],
        keyPoints: [
          'Profit Margin = Net Income / Revenue (how profitable?)',
          'Asset Turnover = Revenue / Assets (how efficient?)',
          'Equity Multiplier = Assets / Equity (how much leverage?)',
          'High ROE from profits/efficiency > High ROE from debt'
        ]
      },
      {
        title: 'NSE Sector ROE Benchmarks',
        content: 'Different sectors have different normal ROE ranges on the NSE.',
        keyPoints: [
          'Banking: 15-25% (higher leverage acceptable)',
          'Manufacturing: 12-20%',
          'Consumer Goods: 10-18%',
          'Agriculture: 8-15% (capital intensive)'
        ],
        examples: [
          'Company A: ROE 25% but Debt/Equity 3.0 → Risky leverage',
          'Company B: ROE 18% with Debt/Equity 0.5 → Quality business',
          'Decision: Company B is better despite lower ROE'
        ]
      }
    ],
    quiz: []
  },
  '16': {
    sections: [
      {
        title: 'Sector Analysis for Value Investors',
        content: 'Understanding sector dynamics helps identify when entire sectors are undervalued, creating multiple opportunities.',
        keyPoints: [
          'Cyclical sectors: Earnings fluctuate with economy',
          'Defensive sectors: Stable earnings regardless of economy',
          'Growth sectors: High growth but often expensive',
          'Value investors focus on out-of-favor sectors with good fundamentals'
        ]
      },
      {
        title: 'NSE Sector Classification',
        content: 'How different NSE sectors behave and when to buy them.',
        keyPoints: [
          'Cyclical: Banking, Construction, Manufacturing, Real Estate - Buy during downturns',
          'Defensive: Utilities, Telecom, Consumer Staples - Focus on absolute valuation',
          'Growth: Technology, E-commerce, Fintech - Rarely qualify as value on NSE'
        ],
        examples: [
          '2016 Banking Crisis: Buy cyclical banks when P/E looks high due to low earnings',
          'COVID-19: Defensive telecom (Safaricom) held up, cyclical sectors crashed',
          'Interest rate hikes: Negative for banks short-term, but creates buying opportunity'
        ]
      },
      {
        title: 'Kenya-Specific Factors',
        content: 'Unique factors that affect NSE sector valuations.',
        keyPoints: [
          'Interest Rates: Rising hurts banks short-term, helps long-term profitability',
          'KES/USD Rate: Depreciation hurts importers, helps exporters (tea, coffee)',
          'Regulation: Banking cap removal 2019 boosted bank valuations',
          'Government Policy: Energy policy affects KenGen, Kenya Power valuations'
        ]
      }
    ],
    quiz: []
  },
  '17': {
    sections: [
      {
        title: 'Historical Analysis - Finding Patterns',
        content: 'Studying 10 years of company history reveals cyclical patterns, durability, and normal valuation ranges.',
        keyPoints: [
          'Revenue trends: Growing, stable, or declining?',
          'Profitability trends: Margins expanding or contracting?',
          'Balance sheet evolution: Debt growing or shrinking?',
          'Valuation history: Current P/E vs 10-year range'
        ]
      },
      {
        title: '10-Year Analysis Framework',
        content: 'Key questions to answer when reviewing historical data.',
        keyPoints: [
          'Revenue: Has it grown consistently? Cyclical patterns? Market share trend?',
          'Margins: Expanding margins = competitive advantage, Contracting = pressure',
          'Debt: Is debt growing faster than business? Can company service debt in downturn?',
          'Dividends: How many consecutive years? Dividend growth rate? Payout ratio sustainable?'
        ],
        examples: [
          'KCB 2010-2020: Revenue CAGR 12%, consistent dividend growth, expanding branches',
          'Manufacturing Co: Revenue flat 2015-2020, margins declining 30%→20% → Avoid',
          'Bank P/E range: Low 6, Average 10, High 14. Current 7 = near historical low = opportunity'
        ]
      },
      {
        title: 'Case Study: 2016 Banking Crisis',
        content: 'Real NSE example of historical analysis leading to value opportunity.',
        keyPoints: [
          'Situation: Bank P/E ratios fell to 4-6 from normal 8-12',
          'Analysis: NPLs increased but quality banks maintained profitability',
          'Historical Context: Banks always recovered from NPL spikes within 2-3 years',
          'Action: Buy quality banks (KCB, Equity) at distressed valuations',
          'Outcome: 2017-2019 recovery delivered 50-100% returns'
        ]
      }
    ],
    quiz: []
  },
  '18': {
    sections: [
      {
        title: 'Market Cycles and Behavioral Opportunities',
        content: 'Market psychology creates predictable patterns. Value investors exploit fear and greed.',
        keyPoints: [
          'Bull Market: NSE 20 rising, foreign inflows, IPO mania → Be cautious',
          'Bear Market: NSE 20 falling, foreign outflows, low volume → Be aggressive',
          'Sideways Market: Stock-specific opportunities, sector rotation',
          'Buffett wisdom: Be fearful when others are greedy, greedy when others are fearful'
        ]
      },
      {
        title: 'NSE Sentiment Indicators',
        content: 'Signals that indicate extreme pessimism or optimism on the NSE.',
        keyPoints: [
          'Extreme Pessimism: NSE 20 P/E <6, Dividend yields >8%, Foreign sellers for 6+ months, Doom headlines',
          'Extreme Optimism: NSE 20 P/E >15, Dividend yields <3%, IPOs oversubscribed 10x+, Euphoric media',
          'Contrarian Approach: Invest when pessimism extreme, raise cash when optimism extreme'
        ],
        examples: [
          'March 2020 COVID Crash: NSE 20 down 40%, pessimism extreme → BUY opportunity',
          '2007 Bull Market Peak: Everyone investing, media euphoria → Should have been SELLING',
          'Foreign Investor Flows: Check NSE weekly reports - sustained outflows = opportunity'
        ]
      },
      {
        title: 'Behavioral Biases to Exploit',
        content: 'Common investor mistakes create opportunities for disciplined value investors.',
        keyPoints: [
          'Recency Bias: Market overreacts to recent bad news (Buy after panic)',
          'Herd Mentality: Everyone avoiding a sector creates opportunity',
          'Loss Aversion: Panic selling during crisis (Be the buyer)',
          'Anchoring: "Stock used to be KES 100" → Ignore past price, calculate intrinsic value'
        ]
      }
    ],
    quiz: []
  },
  '19': {
    sections: [
      {
        title: 'Benjamin Graham Defensive Investor Criteria',
        content: 'Graham 8 criteria for conservative investors seeking safety and steady returns.',
        keyPoints: [
          'Adequate Size: Market cap >KES 10B for NSE',
          'Strong Financial Condition: Current Ratio ≥2.0',
          'Earnings Stability: Positive earnings each of past 5-10 years',
          'Dividend Record: Uninterrupted dividends for 5+ years on NSE',
          'Earnings Growth: ≥33% over past 10 years (3% annually)',
          'Moderate P/E: <12 for large caps, <10 for small caps',
          'Moderate P/B: ≤1.5, ideally <1.0',
          'Graham Number: Price ≤√(22.5 × EPS × BVPS)'
        ]
      },
      {
        title: 'Graham Number Explained',
        content: 'A single metric combining P/E and P/B limits.',
        formulas: [
          {
            name: 'Graham Number',
            formula: 'Graham Number = √(22.5 × EPS × Book Value per Share)',
            example: 'EPS KES 2.50, BVPS KES 12 → Graham Number = √(22.5×2.5×12) = KES 25.98'
          }
        ],
        keyPoints: [
          '22.5 = P/E of 15 × P/B of 1.5 (Graham maximum limits)',
          'Stock price should not exceed Graham Number',
          'Combines value and quality in single formula',
          'Rare to find on NSE but appears during market crashes'
        ]
      },
      {
        title: 'Warren Buffett Quality Principles',
        content: 'Buffett evolved Graham approach to focus on business quality over statistical cheapness.',
        keyPoints: [
          'Economic Moat: Durable competitive advantage (brands, licenses, scale)',
          'Management Quality: Honest, competent, shareholder-friendly',
          'Understandable Business: Only invest in businesses you understand',
          'Favorable Long-Term Prospects: Will people need this in 20 years?'
        ],
        examples: [
          'Moat Example: Safaricom (network effects, brand, license, 42M customers)',
          'Management: KCB management paid dividends every year, grew branches responsibly',
          'Understandable: Banking is simple - borrow low, lend high',
          'Long-term: People will still need banking, beer, telecom in 20 years'
        ]
      }
    ],
    quiz: []
  },
  '20': {
    sections: [
      {
        title: 'Special Situations - Advanced Opportunities',
        content: 'Corporate events create unique value opportunities for prepared investors.',
        keyPoints: [
          'Spin-offs: Parent sells subsidiary - often undervalued initially',
          'Rights Issues: Buy new shares at discount - compounds value if undervalued',
          'Privatization/Delisting: Controlling shareholder buys out minorities',
          'Regulatory Changes: New rules create winners and losers'
        ],
        examples: [
          'Rights Issue: If stock worth KES 50 trades at KES 40, rights at KES 35 = double discount',
          '2019 Interest Rate Cap Removal: Boosted bank valuations 20-30%',
          'Privatization: Buy before offer if significantly undervalued'
        ]
      },
      {
        title: 'Value Traps - What to Avoid',
        content: 'Some stocks look cheap but deserve to be cheap. Learn to spot value traps.',
        keyPoints: [
          'Declining Revenue: 3+ years of falling sales',
          'Eroding Moat: Competitive position deteriorating',
          'High Debt in Downturn: Cannot service debt if earnings fall',
          'Disruption Threat: Industry being replaced by new technology',
          'Poor Management: Track record of destroying shareholder value'
        ],
        examples: [
          'Manufacturer losing to imports: P/E 6, P/B 0.8 but business dying → VALUE TRAP',
          'Bank with persistent bad loans: Low valuation reflects real problems',
          'Retailer disrupted by e-commerce: Cheap for a reason'
        ]
      },
      {
        title: 'How to Avoid Value Traps',
        content: 'Due diligence steps to separate true value from value traps.',
        keyPoints: [
          'Ask WHY stock is cheap: Temporary problem or permanent decline?',
          'Check industry trends: Growing, stable, or dying industry?',
          'Assess whether problems are fixable or terminal',
          'Require strong fundamentals: Consistent earnings, low debt, positive cash flow',
          'When in doubt, skip it - plenty of other opportunities'
        ]
      }
    ],
    quiz: []
  }
};

export default function LessonDetail({ navigation, route }: Props) {
  const { lessonId, title, level } = route.params;
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const lessonContent = LESSON_DATA[lessonId] || LESSON_DATA['1'];
  const section = lessonContent.sections[currentSection];

  const handleNext = () => {
    hapticFeedback.light();
    if (currentSection < lessonContent.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      if (lessonContent.quiz && lessonContent.quiz.length > 0) {
        Alert.alert(
          'Lesson Complete!',
          'Ready to test your knowledge?',
          [
            { text: 'Back to Lessons', onPress: () => navigation.goBack() },
            { text: 'Take Quiz', onPress: () => {} }
          ]
        );
      } else {
        navigation.goBack();
      }
    }
  };

  const handlePrevious = () => {
    hapticFeedback.light();
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{level} Level</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentSection + 1) / lessonContent.sections.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Section {currentSection + 1} of {lessonContent.sections.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.lessonSection}>
          <Text style={styles.sectionTitle}>{section?.title || 'Loading...'}</Text>
          <Text style={styles.sectionText}>{section?.content || ''}</Text>

          {section?.formulas && section.formulas.length > 0 && (
            <Card variant="glass" style={styles.formulaCard}>
              <Text style={styles.formulaTitle}>Key Formulas</Text>
              {section.formulas.map((formula: any, idx: number) => (
                <View key={idx} style={styles.formulaItem}>
                  <Text style={styles.formulaName}>{formula.name}</Text>
                  <Text style={styles.formulaText}>{formula.formula}</Text>
                  {formula.example && (
                    <Text style={styles.formulaExample}>Example: {formula.example}</Text>
                  )}
                </View>
              ))}
            </Card>
          )}

          {section?.examples && section.examples.length > 0 && (
            <Card variant="outline" style={styles.examplesCard}>
              <Text style={styles.examplesTitle}>Practical Examples</Text>
              {section.examples.map((example: string, idx: number) => (
                <View key={idx} style={styles.exampleItem}>
                  <Ionicons name="bulb-outline" size={16} color={colors.warning} />
                  <Text style={styles.exampleText}>{example}</Text>
                </View>
              ))}
            </Card>
          )}

          {section?.keyPoints && section.keyPoints.length > 0 && (
            <View style={styles.keyPointsContainer}>
              <Text style={styles.keyPointsTitle}>Key Takeaways:</Text>
              {section.keyPoints.map((point: string, idx: number) => (
                <View key={idx} style={styles.keyPointItem}>
                  <View style={styles.keyPointBullet} />
                  <Text style={styles.keyPointText}>{point}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentSection === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentSection === 0}
        >
          <Ionicons name="chevron-back" size={20} color={currentSection === 0 ? colors.text.disabled : colors.primary.main} />
          <Text style={[styles.navButtonText, currentSection === 0 && styles.navButtonTextDisabled]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNext}
        >
          <Text style={styles.navButtonText}>
            {currentSection === lessonContent.sections.length - 1 ? 'Complete' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary.main} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  lessonSection: {
    gap: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  formulaCard: {
    padding: spacing.md,
  },
  formulaTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
    marginBottom: spacing.md,
  },
  formulaItem: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
  },
  formulaName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  formulaText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
  },
  formulaExample: {
    fontSize: typography.fontSize.sm,
    color: colors.info,
    fontStyle: 'italic',
  },
  examplesCard: {
    padding: spacing.md,
  },
  examplesTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  exampleItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  exampleText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  keyPointsContainer: {
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  keyPointsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  keyPointItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  keyPointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginTop: 7,
  },
  keyPointText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  navButtonTextDisabled: {
    color: colors.text.disabled,
  },
});