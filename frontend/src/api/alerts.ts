import api from './client';

export interface Alert {
  id: string;
  symbol: string;
  alert_type: 'above' | 'below' | 'percent_change';
  target_price?: number;
  base_price?: number;
  target_percent?: number;
  active: boolean;
  triggered: boolean;
  triggered_at?: string;
  triggered_price?: number;
  created_at: string;
}

export interface CreateAlertRequest {
  symbol: string;
  alert_type: 'above' | 'below' | 'percent_change';
  target_price?: number;
  base_price?: number;
  target_percent?: number;
}

export interface UpdateAlertRequest {
  active?: boolean;
  target_price?: number;
  target_percent?: number;
}

export const alertsApi = {
  async createAlert(data: CreateAlertRequest): Promise<Alert> {
    const response = await api.post('/alerts/', data);
    return response.data;
  },

  async listAlerts(activeOnly: boolean = true): Promise<Alert[]> {
    const response = await api.get('/alerts/', {
      params: { active_only: activeOnly },
    });
    return response.data;
  },

  async getAlert(alertId: string): Promise<Alert> {
    const response = await api.get(`/alerts/${alertId}`);
    return response.data;
  },

  async updateAlert(alertId: string, data: UpdateAlertRequest): Promise<Alert> {
    const response = await api.put(`/alerts/${alertId}`, data);
    return response.data;
  },

  async deleteAlert(alertId: string): Promise<void> {
    await api.delete(`/alerts/${alertId}`);
  },
};

