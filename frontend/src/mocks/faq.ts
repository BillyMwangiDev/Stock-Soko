export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'trading' | 'account' | 'payments' | 'general';
}

export const mockFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I buy stocks?',
    answer: 'Navigate to Markets, search for a stock, tap on it to view details, then tap the "Buy" button. Enter the quantity you want to purchase and review your order before confirming.',
    category: 'trading',
  },
  {
    id: '2',
    question: 'What are the trading fees?',
    answer: 'Stock Soko charges a competitive 0.12% brokerage fee on all transactions. This fee is displayed before you confirm any order.',
    category: 'trading',
  },
  {
    id: '3',
    question: 'How long does KYC verification take?',
    answer: "KYC verification typically takes 1-2 business days. You'll receive a notification once your documents have been reviewed. Ensure all documents are clear and valid.",
    category: 'account',
  },
  {
    id: '4',
    question: 'How do I deposit funds?',
    answer: 'Go to your Wallet, tap "Deposit," and follow the M-Pesa prompts. Funds are usually available in your account within minutes.',
    category: 'payments',
  },
  {
    id: '5',
    question: 'Can I sell my shares anytime?',
    answer: 'Yes, you can place sell orders during market hours (NSE: 9:00 AM - 3:00 PM EAT, Monday-Friday). Orders placed outside market hours will be queued for the next trading session.',
    category: 'trading',
  },
  {
    id: '6',
    question: 'What is fractional share trading?',
    answer: 'Fractional shares allow you to buy a portion of a share instead of a whole share. This makes expensive stocks more accessible. Enable "Allow Fractional" when placing an order.',
    category: 'trading',
  },
  {
    id: '7',
    question: 'How do I withdraw my funds?',
    answer: 'Go to your Wallet, tap "Withdraw," enter the amount you want to withdraw, and confirm. Funds will be sent to your registered M-Pesa number within 24 hours.',
    category: 'payments',
  },
  {
    id: '8',
    question: 'What documents do I need for KYC?',
    answer: 'You need a valid National ID or Passport, and a recent utility bill or bank statement for proof of address. All documents must be clear and legible.',
    category: 'account',
  },
  {
    id: '9',
    question: 'Is my money safe?',
    answer: 'Yes, Stock Soko is regulated by the Capital Markets Authority (CMA). Your funds are held in segregated accounts, and we use bank-level encryption for all transactions.',
    category: 'general',
  },
  {
    id: '10',
    question: 'What are dividends?',
    answer: 'Dividends are payments made by companies to shareholders from their profits. If you own shares in a company that pays dividends, you will receive your share automatically.',
    category: 'general',
  },
  {
    id: '11',
    question: 'How do I set a price alert?',
    answer: 'Go to the stock detail page, tap the bell icon, and set your target price. You will receive a notification when the stock reaches your target price.',
    category: 'trading',
  },
  {
    id: '12',
    question: 'Can I cancel an order?',
    answer: 'You can cancel pending limit orders at any time before they are executed. Go to your Trade History, find the order, and tap "Cancel Order."',
    category: 'trading',
  },
];