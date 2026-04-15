import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: environment.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  get<T>(url: string): Promise<T> {
    return this.api.get<T>(url).then((response) => response.data);
  }

  post<T>(url: string, data: any): Promise<T> {
    return this.api.post<T>(url, data).then((response) => response.data);
  }

  put<T>(url: string, data: any): Promise<T> {
    return this.api.put<T>(url, data).then((response) => response.data);
  }

  delete<T>(url: string): Promise<T> {
    return this.api.delete<T>(url).then((response) => response.data);
  }
}

