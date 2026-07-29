const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private getHeaders(isMultipart = false): HeadersInit {
    const headers: HeadersInit = {};
    
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('startuphub_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      let errorMessage = 'An error occurred during your request';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Fallback if response is not JSON
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  private async request<T>(path: string, options: RequestInit): Promise<T> {
    options.credentials = 'include';
    options.headers = {
      ...this.getHeaders(options.body instanceof FormData),
      ...options.headers,
    };

    let response = await fetch(`${API_BASE_URL}${path}`, options);

    if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/register') && !path.includes('/auth/refresh')) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newToken = data.token;
            if (typeof window !== 'undefined') {
              localStorage.setItem('startuphub_token', newToken);
            }
            this.isRefreshing = false;
            this.onRefreshed(newToken);
          } else {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            if (typeof window !== 'undefined') {
              localStorage.removeItem('startuphub_token');
              window.location.href = '/login';
            }
            throw new Error('Session expired');
          }
        } catch (error) {
          this.isRefreshing = false;
          this.refreshSubscribers = [];
          if (typeof window !== 'undefined') {
            localStorage.removeItem('startuphub_token');
            window.location.href = '/login';
          }
          throw error;
        }
      }

      return new Promise<T>((resolve, reject) => {
        this.subscribeTokenRefresh((newToken) => {
          const headers = (options.headers as Record<string, string>) || {};
          headers['Authorization'] = `Bearer ${newToken}`;
          options.headers = headers;

          fetch(`${API_BASE_URL}${path}`, options)
            .then((res) => this.handleResponse(res))
            .then((data) => resolve(data as T))
            .catch((err) => reject(err));
        });
      });
    }

    return this.handleResponse(response);
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, {
      method: 'GET',
    });
  }

  async post<T>(path: string, body: any, isMultipart = false): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: isMultipart ? body : JSON.stringify(body),
    });
  }

  async put<T>(path: string, body: any, isMultipart = false): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: isMultipart ? body : JSON.stringify(body),
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
export default api;
