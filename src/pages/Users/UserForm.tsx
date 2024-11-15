import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { userService, type UserFormData } from '../../services/api';

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string(),
  tipoEvento: z.enum(['admin', 'organizador', 'usuario']),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  cidade: z.string().min(3, 'Cidade inválida')
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "Senhas não conferem",
  path: ["confirmarSenha"],
});

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: UserFormData | null;
}

export default function UserForm({ onClose, onSuccess, initialData }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || undefined
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      setSubmitError(null);
      if (initialData?.id) {
        await userService.update(initialData.id, data);
      } else {
        await userService.create(data);
      }
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while submitting the form');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {initialData ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome*</label>
            <input
              type="text"
              {...register('nome')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email*</label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {!initialData && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha*</label>
                <input
                  type="password"
                  {...register('senha')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={isSubmitting}
                />
                {errors.senha && (
                  <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Senha*</label>
                <input
                  type="password"
                  {...register('confirmarSenha')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={isSubmitting}
                />
                {errors.confirmarSenha && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha.message}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Usuário*</label>
            <select
              {...register('tipoEvento')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              <option value="">Selecione um tipo</option>
              <option value="admin">Admin</option>
              <option value="organizador">Organizador</option>
              <option value="usuario">Usuário</option>
            </select>
            {errors.tipoEvento && (
              <p className="mt-1 text-sm text-red-600">{errors.tipoEvento.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp*</label>
            <input
              type="tel"
              {...register('whatsapp')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            {errors.whatsapp && (
              <p className="mt-1 text-sm text-red-600">{errors.whatsapp.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cidade*</label>
            <input
              type="text"
              {...register('cidade')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            {errors.cidade && (
              <p className="mt-1 text-sm text-red-600">{errors.cidade.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Enviando...
                </>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}