export type NotificationType = 'trade' | 'news' | 'account';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  ticker?: string;
  actionLabel?: string;
  priority?: 'high' | 'medium' | 'low';
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'trade',
    title: 'Order Executed',
    message: 'Your buy order for 10 shares of KCB at KES 32.50 was executed successfully',
    timestamp: '15m ago',
    read: false,
    ticker: 'KCB',
    actionLabel: 'View Portfolio',
    priority: 'high',
  },
  {
    id: '2',
    type: 'trade',
    title: 'Price Alert Triggered',
    message: 'SCOM reached your target price of KES 45.00',
    timestamp: '1h ago',
    read: false,
    ticker: 'SCOM',
    actionLabel: 'View Stock',
    priority: 'high',
  },
  {
    id: '3',
    type: 'news',
    title: 'Market Update',
    message: 'NSE 20-Share Index gains 1.2% on banking sector strength',
    timestamp: '2h ago',
    read: false,
    actionLabel: 'Read More',
    priority: 'medium',
  },
  {
    id: '4',
    type: 'account',
    title: 'M-Pesa Deposit Confirmed',
    message: 'KES 5,000 successfully added to your wallet',
    timestamp: '3h ago',
    read: true,
    actionLabel: 'View Wallet',
  },
  {
    id: '5',
    type: 'trade',
    title: 'Order Pending',
    message: 'Your limit order for EABL is pending execution',
    timestamp: '1d ago',
    read: true,
    ticker: 'EABL',
  },
  {
    id: '6',
    type: 'news',
    title: 'Dividend Announcement',
    message: 'Safaricom announces dividend of KES 1.40 per share',
    timestamp: '2d ago',
    read: true,
    ticker: 'SCOM',
    actionLabel: 'Learn More',
  },
  {
    id: '7',
    type: 'account',
    title: 'KYC Verification Complete',
    message: 'Your account has been verified. You can now trade without limits.',
    timestamp: '3d ago',
    read: true,
    actionLabel: 'Start Trading',
  },
  {
    id: '8',
    type: 'trade',
    title: 'Stop Loss Triggered',
    message: 'Your stop loss for EQTY was triggered at KES 48.20',
    timestamp: '5d ago',
    read: true,
    ticker: 'EQTY',
    actionLabel: 'View Details',
    priority: 'high',
  },
];