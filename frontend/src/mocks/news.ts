export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url?: string;
  publishedAt: string;
  imageUrl?: string;
  category: 'market' | 'company' | 'economy' | 'technology';
  relatedStocks?: string[];
}

export const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'NSE 20-Share Index Gains 1.2% on Banking Sector Strength',
    summary: 'The Nairobi Securities Exchange benchmark index closed higher on Monday, driven by gains in banking stocks as investors bet on improved earnings.',
    source: 'Business Daily',
    publishedAt: '2 hours ago',
    category: 'market',
    relatedStocks: ['KCB', 'EQTY', 'COOP'],
  },
  {
    id: '2',
    title: 'Safaricom Reports 15% Growth in M-Pesa Revenue',
    summary: 'Safaricom PLC announced a 15% year-over-year increase in M-Pesa revenue, reaching KES 120 billion in the last fiscal year.',
    source: 'The Standard',
    publishedAt: '5 hours ago',
    category: 'company',
    relatedStocks: ['SCOM'],
  },
  {
    id: '3',
    title: 'Central Bank Keeps Interest Rates Unchanged at 13%',
    summary: 'The Central Bank of Kenya maintained its benchmark lending rate at 13%, citing stable inflation and economic growth concerns.',
    source: 'Nation',
    publishedAt: '1 day ago',
    category: 'economy',
  },
  {
    id: '4',
    title: 'East African Breweries Expands Production Capacity',
    summary: 'EABL announces KES 5 billion investment in new brewing facilities to meet growing demand across the region.',
    source: 'Capital FM',
    publishedAt: '1 day ago',
    category: 'company',
    relatedStocks: ['EABL'],
  },
  {
    id: '5',
    title: 'Equity Bank Launches Digital Lending Platform',
    summary: 'Equity Bank unveils new AI-powered lending platform aimed at SMEs, targeting KES 50 billion in loans over the next year.',
    source: 'Business Daily',
    publishedAt: '2 days ago',
    category: 'technology',
    relatedStocks: ['EQTY'],
  },
  {
    id: '6',
    title: 'NSE Trading Volume Up 20% in Q3 2024',
    summary: 'The Nairobi Securities Exchange recorded a 20% increase in trading volume during the third quarter, signaling renewed investor interest.',
    source: 'The Star',
    publishedAt: '2 days ago',
    category: 'market',
  },
  {
    id: '7',
    title: 'KCB Group Eyes Regional Expansion with New Acquisitions',
    summary: 'KCB Group announces plans to acquire two banks in Tanzania and Rwanda as part of its regional growth strategy.',
    source: 'Nation',
    publishedAt: '3 days ago',
    category: 'company',
    relatedStocks: ['KCB'],
  },
  {
    id: '8',
    title: 'Kenya Shilling Strengthens Against Dollar',
    summary: 'The Kenyan shilling appreciated by 2% against the US dollar this week, supported by increased diaspora remittances.',
    source: 'Business Daily',
    publishedAt: '3 days ago',
    category: 'economy',
  },
];