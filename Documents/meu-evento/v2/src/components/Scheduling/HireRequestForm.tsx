import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { useAvailability } from '../../hooks/useAvailability';
import { TimeSlot } from '../../types/appointment';

interface HireRequestFormProps {
    caregiverId: string;
    onClose: () => void;
}

const HireRequestForm: React.FC<HireRequestFormProps> = ({
    caregiverId,
    onClose,
}) => {
    const [user] = useAuthState(auth);
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [requestDetails, setRequestDetails] = useState({
        startTime: '',
        endTime: '',
        notes: '',
    });
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { availableSlots, loading: slotsLoading, error: slotsError } = useAvailability(
        caregiverId,
        selectedDate
    );

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        setSelectedSlot('');
        setRequestDetails(prev => ({
            ...prev,
            startTime: '',
            endTime: ''
        }));
    };

    const handleSlotSelection = (slot: TimeSlot) => {
        if (!slot.available) return;

        setSelectedSlot(slot.startTime);
        setRequestDetails(prev => ({
            ...prev,
            startTime: slot.startTime,
            endTime: slot.endTime
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Create the hire request
            await addDoc(collection(db, 'hireRequests'), {
                caregiverId,
                clientId: user.uid,
                date: selectedDate,
                ...requestDetails,
                createdAt: serverTimestamp(),
                status: 'pending'
            });

            setSuccess('Request sent successfully!');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError('Failed to send request');
            console.error('Error submitting request:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4">Request a Caregiver</h3>
                {(error || slotsError) && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error || slotsError}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Date
                        </label>
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available Time Slots
                        </label>
                        {slotsLoading ? (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {availableSlots.map((slot) => (
                                    <button
                                        type="button"
                                        key={slot.startTime}
                                        onClick={() => handleSlotSelection(slot)}
                                        disabled={!slot.available || loading}
                                        className={`p-2 rounded-lg text-center ${
                                            slot.available
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
                        )}
                    </div>

                    {selectedSlot && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={requestDetails.notes}
                                    onChange={(e) =>
                                        setRequestDetails((prev) => ({
                                            ...prev,
                                            notes: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Add any special notes or requirements..."
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedSlot || loading}
                            className={`px-4 py-2 rounded-lg ${
                                !selectedSlot || loading
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                        >
                            {loading ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HireRequestForm;
