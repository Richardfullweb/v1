import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { X } from 'lucide-react';
import RatingStars from './RatingStars';
import { toast } from 'react-hot-toast';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  caregiverId: string;
  clientId: string;
  user: any;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  caregiverId,
  clientId,
  user,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canRate, setCanRate] = useState(false);

  useEffect(() => {
    const checkAppointmentStatus = async () => {
      if (!appointmentId) return;

      try {
        // Verificar o status do agendamento
        const appointmentRef = doc(db, 'appointments', appointmentId);
        const appointmentDoc = await getDoc(appointmentRef);
        
        if (!appointmentDoc.exists()) {
          setError("Agendamento não encontrado.");
          return;
        }

        const appointmentData = appointmentDoc.data();
        
        // Verificar se o serviço está completo
        if (appointmentData.status !== 'completed') {
          setError("O serviço precisa estar completo para ser avaliado.");
          onClose();
          return;
        }

        // Verificar se já existe uma avaliação
        const ratingRef = doc(db, 'ratings', appointmentId);
        const ratingDoc = await getDoc(ratingRef);

        if (ratingDoc.exists()) {
          setError("Este serviço já foi avaliado.");
          onClose();
          return;
        }

        setCanRate(true);
      } catch (error) {
        console.error("Erro ao verificar status do agendamento:", error);
        setError("Erro ao verificar status do agendamento.");
      }
    };

    if (isOpen) {
      checkAppointmentStatus();
    }
  }, [appointmentId, isOpen]);

  if (!isOpen) return null;

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Você precisa estar logado para avaliar.");
      return;
    }

    if (!canRate) {
      toast.error("Este serviço não pode ser avaliado no momento.");
      return;
    }

    if (rating === null) {
      setError("Por favor, selecione uma avaliação.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar nova avaliação
      await setDoc(doc(db, 'ratings', appointmentId), {
        appointmentId,
        caregiverId,
        clientId,
        rating,
        comment: comment.trim() || undefined,
        createdAt: new Date(),
      });

      toast.success('Avaliação enviada com sucesso!');
      onClose();
    } catch (error) {
      console.error("Erro ao criar avaliação:", error);
      setError("Ocorreu um erro ao salvar a avaliação.");
      toast.error('Erro ao enviar avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-80 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white px-6 pb-6 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-8">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              onClick={onClose}
            >
              <span className="sr-only">Fechar</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                Avaliar Atendimento
              </h3>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Como você avalia o atendimento?
                  </label>
                  <div className="flex justify-center sm:justify-start">
                    <RatingStars rating={rating} onChange={handleRatingChange} size="lg" />
                  </div>
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Comentário (opcional)
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-none p-2 bg-gray-50 border-2 border-gray-200"
                    placeholder="Compartilhe sua experiência..."
                  />
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;