import axios from 'axios';
import type { 
  CredentialCreate, 
  CredentialResponse, 
  CredentialVerificationRequest, 
  CredentialVerificationResponse 
} from '../types/credential';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
  
  createCredential: async (data: CredentialCreate): Promise<CredentialResponse> => {
    const response = await apiClient.post('/credentials', data);
    return response.data;
  },

  verifyCredential: async (data: CredentialVerificationRequest): Promise<CredentialVerificationResponse> => {
    const response = await apiClient.post('/credentials/verify', data);
    return response.data;
  },

  revokeCredential: async (id: string, reason: string) => {
    const response = await apiClient.post(`/credentials/${id}/revoke`, { reason });
    return response.data;
  },

  getCredential: async (id: string): Promise<CredentialResponse> => {
    const response = await apiClient.get(`/credentials/${id}`);
    return response.data;
  },

  bulkIssueCredentials: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/credentials/bulk-issue', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
