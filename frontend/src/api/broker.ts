/**
 * Broker Accounts API
 * 
 * Handles broker account management including:
 * - Fetching broker accounts with balances
 * - Getting specific account details
 * - Setting primary account
 */

import { api } from './client';

export interface BrokerAccount {
  account_id: string;
  broker_id: string;
  broker_name: string;
  balance: number;
  reserved_balance: number;
  available_balance: number;
  total_deposits: number;
  total_withdrawals: number;
  is_primary: boolean;
  status: string;
}

export interface BrokerInfo {
  id: string;
  name: string;
  has_api: boolean;
  requires_cds: boolean;
  status: 'live' | 'sandbox';
}

/**
 * Get all broker accounts for the current user with their balances
 */
export const getBrokerAccounts = async (): Promise<BrokerAccount[]> => {
  try {
    const response = await api.get<BrokerAccount[]>('/broker/accounts');
    return response.data;
  } catch (error: any) {
    console.error('[Broker API] Failed to fetch accounts:', error);
    
    // Return mock data for development/testing
    if (__DEV__) {
      console.log('[Broker API] Using mock data');
      return [
        {
          account_id: 'mock-account-1',
          broker_id: 'genghis',
          broker_name: 'Genghis Capital',
          balance: 50000,
          reserved_balance: 10000,
          available_balance: 40000,
          total_deposits: 100000,
          total_withdrawals: 50000,
          is_primary: true,
          status: 'active'
        },
        {
          account_id: 'mock-account-2',
          broker_id: 'faida',
          broker_name: 'Faida Investment Bank',
          balance: 25000,
          reserved_balance: 0,
          available_balance: 25000,
          total_deposits: 25000,
          total_withdrawals: 0,
          is_primary: false,
          status: 'active'
        }
      ];
    }
    
    throw error;
  }
};

/**
 * Get balance for a specific broker account
 */
export const getBrokerAccountBalance = async (accountId: string): Promise<BrokerAccount> => {
  try {
    const response = await api.get<BrokerAccount>(`/broker/accounts/${accountId}`);
    return response.data;
  } catch (error: any) {
    console.error('[Broker API] Failed to fetch account balance:', error);
    throw error;
  }
};

/**
 * Set a broker account as the primary trading account
 */
export const setPrimaryAccount = async (accountId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post<{ success: boolean; message: string; account_id: string }>(
      `/broker/accounts/${accountId}/set-primary`
    );
    return {
      success: response.data.success,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('[Broker API] Failed to set primary account:', error);
    throw error;
  }
};

/**
 * Get list of available brokers
 */
export const getAvailableBrokers = async (): Promise<{ brokers: BrokerInfo[]; count: number }> => {
  try {
    const response = await api.get<{ brokers: BrokerInfo[]; count: number }>('/broker/list');
    return response.data;
  } catch (error: any) {
    console.error('[Broker API] Failed to fetch available brokers:', error);
    throw error;
  }
};

/**
 * Initiate M-PESA deposit to a specific broker account
 */
export interface DepositRequest {
  phone_number: string;
  amount: number;
  account_id?: string; // Optional: defaults to primary account
}

export interface DepositResponse {
  checkout_request_id: string;
  status: string;
  message: string;
}

export const initiateDeposit = async (request: DepositRequest): Promise<DepositResponse> => {
  try {
    const response = await api.post<DepositResponse>('/payments/mpesa/deposit', request);
    return response.data;
  } catch (error: any) {
    console.error('[Broker API] Failed to initiate deposit:', error);
    throw error;
  }
};

/**
 * Check M-PESA transaction status
 */
export interface TransactionStatus {
  status: string;
  result_code: string;
  result_desc: string;
  checkout_request_id: string;
}

export const checkTransactionStatus = async (checkoutRequestId: string): Promise<TransactionStatus> => {
  try {
    const response = await api.get<TransactionStatus>(`/payments/mpesa/status/${checkoutRequestId}`);
    return response.data;
  } catch (error: any) {
    console.error('[Broker API] Failed to check transaction status:', error);
    throw error;
  }
};

export default {
  getBrokerAccounts,
  getBrokerAccountBalance,
  setPrimaryAccount,
  getAvailableBrokers,
  initiateDeposit,
  checkTransactionStatus
};

