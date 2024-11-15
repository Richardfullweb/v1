import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Edit2, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import type { User } from '../types/user';
import UserForm from './Users/UserForm';
import { userService, type UserResponse, ApiError } from '../services/api';

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  organizador: 'bg-blue-100 text-blue-800',
  usuario: 'bg-gray-100 text-gray-800'
};

const roleLabels = {
  admin: 'Administrador',
  organizador: 'Organizador',
  usuario: 'Usuário'
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getAll();
      if (response.success && response.data) {
        const formattedUsers = response.data.map((user: UserResponse) => ({
          id: user.id,
          name: user.nome,
          email: user.email,
          role: user.tipoEvento,
          phone: user.whatsapp,
          location: user.cidade,
          status: user.status,
          createdAt: user.createdAt,
          password: '', // We don't receive passwords from the API
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=random`
        }));
        setUsers(formattedUsers);
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.details || err.message
        : 'Failed to load users. Please try again later.';
      setError(errorMessage);
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    loadUsers(); // Reload users after successful creation/update
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const response = await userService.delete(userId);
        if (response.success) {
          setUsers(users.filter(user => user.id !== userId));
        }
      } catch (err) {
        const errorMessage = err instanceof ApiError 
          ? err.details || err.message
          : 'Failed to delete user. Please try again later.';
        setError(errorMessage);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <button
          onClick={handleCreateUser}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Usuário
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nenhum usuário encontrado
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar}
                        alt={user.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="w-4 h-4 mr-1" />
                      {user.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {user.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs rounded-full ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <UserForm
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
          initialData={selectedUser}
        />
      )}
    </div>
  );
}