const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
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

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async post<T>(path: string, body: any, isMultipart = false): Promise<T> {
    const headers = this.getHeaders(isMultipart);
    const options: RequestInit = {
      method: 'POST',
      headers,
      body: isMultipart ? body : JSON.stringify(body),
    };

    const response = await fetch(`${API_BASE_URL}${path}`, options);
    return this.handleResponse(response);
  }

  async put<T>(path: string, body: any, isMultipart = false): Promise<T> {
    const headers = this.getHeaders(isMultipart);
    const options: RequestInit = {
      method: 'PUT',
      headers,
      body: isMultipart ? body : JSON.stringify(body),
    };

    const response = await fetch(`${API_BASE_URL}${path}`, options);
    return this.handleResponse(response);
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiService();
export default api;
