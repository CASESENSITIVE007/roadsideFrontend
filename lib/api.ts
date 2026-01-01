// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken() {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  private getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: {
    email: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    role: string;
  }) {
    return this.request<any>('/users/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(credentials: LoginCredentials) {
    const response = await this.request<LoginResponse>('/users/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    // Store user data for quick access
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(response.user));
    }
    return response;
  }

  async logout() {
    await this.request('/users/logout/', { method: 'POST' });
    this.clearToken();
  }

  async getCurrentUser() {
    return this.request('/users/me/', { method: 'GET' });
  }

  async updateProfile(data: any) {
    return this.request('/users/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Provider endpoints
  async getProviders() {
    return this.request('/providers/', { method: 'GET' });
  }

  async getProviderProfile() {
    return this.request('/providers/my_profile/', { method: 'GET' });
  }

  async createProviderProfile(data: {
    company_name: string;
    license_number: string;
    vehicle_type: string;
    vehicle_plate: string;
    insurance_provider?: string;
    insurance_policy_number?: string;
  }) {
    return this.request('/providers/create_profile/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProviderLocation(latitude: number, longitude: number) {
    return this.request('/providers/update_location/', {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  async updateProviderStatus(status: 'online' | 'busy' | 'offline') {
    return this.request('/providers/update_status/', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Request endpoints
  async createRequest(data: {
    latitude: number;
    longitude: number;
    location_address: string;
    service_type: string;
    priority: string;
    description: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    vehicle_plate: string;
  }) {
    return this.request('/requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyRequests() {
    return this.request('/requests/my_requests/', { method: 'GET' });
  }

  async getMyAssignments() {
    return this.request('/requests/my_assignments/', { method: 'GET' });
  }

  async getRequest(id: number) {
    return this.request(`/requests/${id}/`, { method: 'GET' });
  }

  async assignRequest(id: number) {
    return this.request(`/requests/${id}/assign/`, { method: 'POST' });
  }

  async completeRequest(id: number, final_cost: number) {
    return this.request(`/requests/${id}/complete/`, {
      method: 'POST',
      body: JSON.stringify({ final_cost }),
    });
  }

  async cancelRequest(id: number) {
    return this.request(`/requests/${id}/cancel/`, { method: 'POST' });
  }

  // Services endpoints
  async getServices() {
    return this.request('/services/', { method: 'GET' });
  }

  // Locations endpoints
  async getLocations() {
    return this.request('/locations/', { method: 'GET' });
  }
}

export const apiClient = new ApiClient();
