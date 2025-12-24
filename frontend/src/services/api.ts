const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}/api${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'An error occurred');
    }

    // Check if response is CSV
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      return response;
    }

    return response.json();
  }

  // Auth
  async register(name: string, email: string, pin: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, pin }),
    });
  }

  async login(email: string, pin: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, pin }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(data: {
    name?: string;
    default_currency?: string;
    biometric_enabled?: boolean;
    auto_lock_enabled?: boolean;
    auto_lock_timeout?: number;
  }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async verifyPin(pin: string) {
    return this.request('/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  }

  async updatePin(currentPin: string, newPin: string) {
    return this.request('/auth/update-pin', {
      method: 'PUT',
      body: JSON.stringify({ current_pin: currentPin, new_pin: newPin }),
    });
  }

  async checkSession() {
    return this.request('/auth/session');
  }

  // Groups
  async getGroups() {
    return this.request('/groups');
  }

  async createGroup(name: string, type: string = 'shared') {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify({ name, type }),
    });
  }

  async getGroup(groupId: string) {
    return this.request(`/groups/${groupId}`);
  }

  async updateGroup(groupId: string, name: string) {
    return this.request(`/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async joinGroup(inviteCode: string) {
    return this.request('/groups/join', {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
    });
  }

  async leaveGroup(groupId: string) {
    return this.request(`/groups/${groupId}/leave`, {
      method: 'POST',
    });
  }

  async deleteGroup(groupId: string) {
    return this.request(`/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories(groupId?: string) {
    const query = groupId ? `?group_id=${groupId}` : '';
    return this.request(`/categories${query}`);
  }

  async createCategory(data: { name: string; icon?: string; color?: string }, groupId: string) {
    return this.request(`/categories?group_id=${groupId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(categoryId: string) {
    return this.request(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  // Expenses
  async createExpense(data: {
    amount: number;
    currency: string;
    category_id: string;
    group_id: string;
    description?: string;
    date?: string;
  }) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExpenses(params?: {
    group_id?: string;
    start_date?: string;
    end_date?: string;
    category_id?: string;
    paid_by?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request(`/expenses${query ? `?${query}` : ''}`);
  }

  async getExpense(expenseId: string) {
    return this.request(`/expenses/${expenseId}`);
  }

  async updateExpense(expenseId: string, data: {
    amount?: number;
    currency?: string;
    category_id?: string;
    description?: string;
    date?: string;
  }) {
    return this.request(`/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(expenseId: string) {
    return this.request(`/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalyticsSummary(groupId?: string) {
    const query = groupId ? `?group_id=${groupId}` : '';
    return this.request(`/analytics/summary${query}`);
  }

  async getAnalyticsByCategory(params?: { group_id?: string; start_date?: string; end_date?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request(`/analytics/by-category${query ? `?${query}` : ''}`);
  }

  async getAnalyticsByMember(params?: { group_id?: string; start_date?: string; end_date?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request(`/analytics/by-member${query ? `?${query}` : ''}`);
  }

  async getAnalyticsByGroup(params?: { start_date?: string; end_date?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request(`/analytics/by-group${query ? `?${query}` : ''}`);
  }

  async getAnalyticsTrends(groupId?: string, months: number = 6) {
    let query = `?months=${months}`;
    if (groupId) query += `&group_id=${groupId}`;
    return this.request(`/analytics/trends${query}`);
  }

  async getAnalyticsDaily(groupId?: string, days: number = 30) {
    let query = `?days=${days}`;
    if (groupId) query += `&group_id=${groupId}`;
    return this.request(`/analytics/daily${query}`);
  }

  // Export
  async exportExpenses(data: {
    group_id?: string;
    export_type: 'monthly' | 'all' | 'range';
    start_date?: string;
    end_date?: string;
    month?: number;
    year?: number;
  }) {
    return this.request('/export/csv', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Utilities
  async getCurrencies() {
    return this.request('/currencies');
  }
}

export const api = new ApiService();
