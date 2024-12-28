import React, { useEffect, useState } from 'react';
import { firestore } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';

const MultiHourAppointmentBooking = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [user, authLoading] = useAuthState(auth);
    const [duration, setDuration] = useState<number>(1); // Por padrão 1 hora
    const caregiverId = "LPGtpvgoTKSQ6qcfwSJ0k6mpSbH2"; // Exemplo de caregiverId

    // Função auxiliar para converter horários em minutos desde a meia-noite
    const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Gerar horários disponíveis (das 8h às 20h, em intervalos de 1 hora)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour < 20; hour++) {
            slots.push({ startTime: `${hour}:00`, endTime: `${hour + 1}:00` });
        }
        return slots;
    };

    const generateTimeSlotsForDuration = (startHour: string, duration: number) => {
        const slots = [];
        const startMinutes = timeToMinutes(startHour);
        for (let i = 0; i < duration; i++) {
            const slotStartMinutes = startMinutes + (i * 60);
            const slotEndMinutes = slotStartMinutes + 60;

            const slotStartTime = `${Math.floor(slotStartMinutes / 60)}:${(slotStartMinutes % 60) === 0 ? '00' : slotStartMinutes % 60}`;
            const slotEndTime = `${Math.floor(slotEndMinutes / 60)}:${(slotEndMinutes % 60) === 0 ? '00' : slotEndMinutes % 60}`;

            slots.push({ startTime: slotStartTime, endTime: slotEndTime });
        }
        return slots;
    };

    // Verificar disponibilidade para a data selecionada
    const checkAvailability = async (date: Date) => {
        setLoading(true);
        setError('');

        try {
            // Criar slots iniciais
            const slots = generateTimeSlots();

            // Buscar agendamentos existentes para a data
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const appointmentsQuery = firestore.collection('appointments')
                .where('caregiverId', '==', caregiverId)
                .where('date', '>=', startOfDay)
                .where('date', '<=', endOfDay)
                .where('status', 'in', ['pending', 'confirmed']);

            const querySnapshot = await appointmentsQuery.get();
            const bookedSlots = querySnapshot.docs.map(doc => ({
                startTime: doc.data().startTime,
                endTime: doc.data().endTime
            }));

            // Marcar slots ocupados
            const newSlots = slots.map(slot => {
                const isBooked = bookedSlots.some(booking => {
                    const bookingStartMinutes = timeToMinutes(booking.startTime);
                    const bookingEndMinutes = timeToMinutes(booking.endTime);
                    const slotStartMinutes = timeToMinutes(slot.startTime);
                    const slotEndMinutes = timeToMinutes(slot.endTime);

                    return (
                        (slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes)
                    );
                });

                return {
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isAvailable: !isBooked
                };
            });

            setAvailableSlots(newSlots);
        } catch (err) {
            setError('Failed to load availability');
            console.error('Error checking availability:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!user || authLoading || !selectedSlot) {
            setError('Não foi possível realizar o agendamento. Verifique se você está logado.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const appointmentDate = new Date(selectedDate!);
            const slots = generateTimeSlotsForDuration(selectedSlot, duration);
            const isSlotAvailable = availableSlots.find(slot => slots.some(s => s.startTime === slot.startTime))?.isAvailable;
            if (!isSlotAvailable) {
                setError('This time slot is no longer available. Please choose another.');
                setLoading(false);
                return;
            }

            for (const slot of slots) {
                const startHour = slot.startTime.split(':')[0];
                const endHour = slot.endTime.split(':')[0];
                const appointmentDateToSave = new Date(selectedDate!);
                appointmentDateToSave.setHours(parseInt(startHour), 0, 0, 0);

                await firestore.collection('appointments').add({
                    caregiverId,
                    clientId: user.uid,
                    date: appointmentDateToSave,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    status: 'pending',
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    updatedAt: firestore.FieldValue.serverTimestamp()
                });
            }

            await checkAvailability(selectedDate!);
            setSelectedSlot('');
        } catch (err) {
            setError('Failed to book appointment');
            console.error('Error booking appointment:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDate) {
            checkAvailability(selectedDate);
        }
    }, [selectedDate, caregiverId]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Book Appointment</h3>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                </label>
                <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                </label>
                <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {[1, 2, 3, 4].map(h => (
                        <option key={h} value={h}>
                            {h} hour(s)
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                        <button
                            key={slot.startTime}
                            onClick={() => setSelectedSlot(slot.startTime)}
                            disabled={!slot.isAvailable || loading}
                            className={`p-2 rounded-lg text-center ${
                                slot.isAvailable
                                    ? selectedSlot === slot.startTime
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {slot.startTime}
                        </button>
                    ))}
                </div>
            </div>

            {selectedSlot && (
                <div className="mb-4">
                    <button
                        onClick={handleBooking}
                        disabled={loading}
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MultiHourAppointmentBooking;
