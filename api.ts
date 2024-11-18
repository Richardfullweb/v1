import axios from 'axios';

const N8N_BASE_URL = 'https://n8n-n8n.n1n956.easypanel.host/webhook';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserFormData {
  id?: string;
  nome: string;
  email: string;
  senha?: string;
  confirmarSenha?: string;
  tipoEvento: 'admin' | 'organizador' | 'usuario';
  whatsapp: string;
  cidade: string;
}

export interface UserResponse {
  id: string;
  nome: string;
  email: string;
  tipoEvento: 'admin' | 'organizador' | 'usuario';
  whatsapp: string;
  cidade: string;
  createdAt: string;
  status: 'ativo' | 'inativo';
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const api = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Mock data for development
const mockUsers: UserResponse[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    tipoEvento: 'admin',
    whatsapp: '(11) 99999-9999',
    cidade: 'São Paulo',
    createdAt: '2024-03-15',
    status: 'ativo'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria@exemplo.com',
    tipoEvento: 'organizador',
    whatsapp: '(11) 88888-8888',
    cidade: 'Rio de Janeiro',
    createdAt: '2024-03-14',
    status: 'ativo'
  }
];

// Interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      throw new ApiError(
        error.response.data.message || 'API Error',
        error.response.status,
        error.response.data.details
      );
    } else if (error.request) {
      // Return mock data in development if API is not available
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock data due to API unavailability');
        return {
          data: {
            success: true,
            data: mockUsers
          }
        };
      }
      throw new ApiError('Network Error', 500, 'No response received from server');
    } else {
      throw new ApiError('Error', 500, error.message);
    }
  }
);

export const userService = {
  async create(data: UserFormData): Promise<ApiResponse<UserResponse>> {
    try {
      const response = await api.post<ApiResponse<UserResponse>>('/user-meu-evento-catolico', {
        'Nome*': data.nome,
        'Email*': data.email,
        'Senha*': data.senha,
        'Confirmar Senha*': data.confirmarSenha,
        'Tipo de Usuário*': data.tipoEvento,
        'Telefone*': data.whatsapp,
        'Localização*': data.cidade,
        submittedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      // In development, simulate successful creation with mock data
      if (process.env.NODE_ENV === 'development' && error instanceof ApiError && error.status === 500) {
        const newUser: UserResponse = {
          id: Date.now().toString(),
          nome: data.nome,
          email: data.email,
          tipoEvento: data.tipoEvento,
          whatsapp: data.whatsapp,
          cidade: data.cidade,
          createdAt: new Date().toISOString(),
          status: 'ativo'
        };
        mockUsers.push(newUser);
        return { success: true, data: newUser };
      }
      throw error;
    }
  },

  async getAll(): Promise<ApiResponse<UserResponse[]>> {
    try {
      const response = await api.get<ApiResponse<UserResponse[]>>('/obter-usuarios');
      return response.data;
    } catch (error) {
      // In development, return mock data if API is not available
      if (process.env.NODE_ENV === 'development' && error instanceof ApiError && error.status === 500) {
        return { success: true, data: mockUsers };
      }
      throw error;
    }
  },

  async update(id: string, data: Partial<UserFormData>): Promise<ApiResponse<UserResponse>> {
    try {
      const response = await api.put<ApiResponse<UserResponse>>(`/user-meu-evento-catolico/${id}`, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      // In development, simulate successful update with mock data
      if (process.env.NODE_ENV === 'development' && error instanceof ApiError && error.status === 500) {
        const index = mockUsers.findIndex(user => user.id === id);
        if (index !== -1) {
          mockUsers[index] = {
            ...mockUsers[index],
            ...data,
            nome: data.nome || mockUsers[index].nome,
            email: data.email || mockUsers[index].email,
            tipoEvento: data.tipoEvento || mockUsers[index].tipoEvento,
            whatsapp: data.whatsapp || mockUsers[index].whatsapp,
            cidade: data.cidade || mockUsers[index].cidade,
          };
          return { success: true, data: mockUsers[index] };
        }
      }
      throw error;
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/user-meu-evento-catolico/${id}`);
      return response.data;
    } catch (error) {
      // In development, simulate successful deletion with mock data
      if (process.env.NODE_ENV === 'development' && error instanceof ApiError && error.status === 500) {
        const index = mockUsers.findIndex(user => user.id === id);
        if (index !== -1) {
          mockUsers.splice(index, 1);
          return { success: true };
        }
      }
      throw error;
    }
  }
};

export default api;