export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  progress?: number;
}

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Stock Market Basics',
    description: 'Learn the fundamentals of stock market investing',
    icon: 'book-outline',
    color: '#10B981',
    progress: 60,
    lessons: [
      {
        id: '1',
        title: 'What is a Stock?',
        description: 'Understanding stock ownership and how markets work',
        duration: '5 min',
        difficulty: 'beginner',
        completed: true,
      },
      {
        id: '2',
        title: 'Reading Stock Prices',
        description: 'How to interpret price movements and market data',
        duration: '7 min',
        difficulty: 'beginner',
        completed: true,
      },
      {
        id: '3',
        title: 'Types of Orders',
        description: 'Market orders, limit orders, and stop losses',
        duration: '6 min',
        difficulty: 'beginner',
        completed: false,
      },
    ],
  },
  {
    id: '2',
    title: 'Fundamental Analysis',
    description: 'Evaluate companies using financial metrics',
    icon: 'analytics-outline',
    color: '#3B82F6',
    progress: 25,
    lessons: [
      {
        id: '4',
        title: 'Reading Financial Statements',
        description: 'Understanding income statements and balance sheets',
        duration: '10 min',
        difficulty: 'intermediate',
        completed: true,
      },
      {
        id: '5',
        title: 'Key Ratios: P/E, ROE, ROA',
        description: 'Essential metrics for stock valuation',
        duration: '8 min',
        difficulty: 'intermediate',
        completed: false,
      },
      {
        id: '6',
        title: 'DCF Valuation',
        description: 'Discounted cash flow analysis basics',
        duration: '12 min',
        difficulty: 'advanced',
        completed: false,
      },
    ],
  },
  {
    id: '3',
    title: 'Technical Analysis',
    description: 'Use charts and patterns to time your trades',
    icon: 'trending-up-outline',
    color: '#F59E0B',
    progress: 0,
    lessons: [
      {
        id: '7',
        title: 'Candlestick Patterns',
        description: 'Reading and interpreting candlestick charts',
        duration: '9 min',
        difficulty: 'intermediate',
        completed: false,
      },
      {
        id: '8',
        title: 'Support and Resistance',
        description: 'Identifying key price levels',
        duration: '8 min',
        difficulty: 'intermediate',
        completed: false,
      },
      {
        id: '9',
        title: 'Moving Averages',
        description: 'Using MA indicators for trend analysis',
        duration: '7 min',
        difficulty: 'intermediate',
        completed: false,
      },
    ],
  },
  {
    id: '4',
    title: 'Risk Management',
    description: 'Protect your capital and manage portfolio risk',
    icon: 'shield-checkmark-outline',
    color: '#EF4444',
    progress: 0,
    lessons: [
      {
        id: '10',
        title: 'Portfolio Diversification',
        description: 'Spreading risk across different assets',
        duration: '6 min',
        difficulty: 'beginner',
        completed: false,
      },
      {
        id: '11',
        title: 'Position Sizing',
        description: 'How much to invest in each trade',
        duration: '7 min',
        difficulty: 'intermediate',
        completed: false,
      },
      {
        id: '12',
        title: 'Stop Loss Strategies',
        description: 'Protecting yourself from big losses',
        duration: '8 min',
        difficulty: 'intermediate',
        completed: false,
      },
    ],
  },
];