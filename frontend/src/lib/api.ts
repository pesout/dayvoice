export interface Todo {
  id: string;
  text: string;
}

export interface Recording {
  id: string;
  createdAt: string;
  durationSeconds: number;
  audioUrl: string;
  transcript: string;
  summary: string;
  todos: Todo[];
}

export interface Digest {
  id: string;
  date: string;
  dayName: string;
  recordingIds: string[];
  summary: string;
  todos: Todo[];
}

const API_BASE = '/api';

class ApiClient {
  private token: string | null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
    });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Požadavek se nezdařil' }));
      throw new Error(error.message || 'Požadavek se nezdařil');
    }

    if (
      response.status === 204 ||
      response.headers.get('content-length') === '0'
    ) {
      return undefined as T;
    }
    return response.json();
  }

  async register(email: string, password: string) {
    return this.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string) {
    const data = await this.request<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.accessToken);
    return data;
  }

  logout() {
    this.setToken(null);
  }

  async getRecordings() {
    return this.request<Recording[]>('/recordings');
  }

  async getRecording(id: string) {
    return this.request<Recording>(`/recordings/${id}`);
  }

  async uploadRecording(audioBlob: Blob, durationSeconds: number) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('durationSeconds', String(durationSeconds));
    return this.request<Recording>('/recordings', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteRecording(id: string) {
    return this.request<void>(`/recordings/${id}`, { method: 'DELETE' });
  }

  async getDigests() {
    return this.request<Digest[]>('/digests');
  }

  async getDigest(id: string) {
    return this.request<Digest>(`/digests/${id}`);
  }
}

export const api = new ApiClient();
