import { toast as hotToast } from 'react-hot-toast';

export const toast = {
  success: (message: string) => {
    hotToast.success(message, {
      style: {
        background: '#10B981',
        color: '#fff',
      },
      duration: 3000,
    });
  },
  error: (message: string) => {
    hotToast.error(message, {
      style: {
        background: '#EF4444',
        color: '#fff',
      },
      duration: 3000,
    });
  },
  info: (message: string) => {
    hotToast(message, {
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
      duration: 3000,
    });
  },
};
