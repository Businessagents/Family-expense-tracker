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

  async updateProfile(data: { name?: string; default_currency?: string }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Family
  async createFamily(name: string) {
    return this.request('/family/create', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async joinFamily(inviteCode: string) {
    return this.request('/family/join', {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
    });
  }

  async getFamily() {
    return this.request('/family');
  }

  async leaveFamily() {
    return this.request('/family/leave', {
      method: 'POST',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(data: { name: string; icon?: string; color?: string }) {
    return this.request('/categories', {
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
    description?: string;
    date?: string;
  }) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExpenses(params?: {
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
  async getAnalyticsSummary() {
    return this.request('/analytics/summary');
  }

  async getAnalyticsByCategory(params?: { start_date?: string; end_date?: string }) {
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

  async getAnalyticsByMember(params?: { start_date?: string; end_date?: string }) {
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

  async getAnalyticsTrends(months: number = 6) {
    return this.request(`/analytics/trends?months=${months}`);
  }

  async getAnalyticsDaily(days: number = 30) {
    return this.request(`/analytics/daily?days=${days}`);
  }

  // Utilities
  async getCurrencies() {
    return this.request('/currencies');
  }
}

export const api = new ApiService();
