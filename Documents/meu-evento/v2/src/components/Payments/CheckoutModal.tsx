import React from 'react';

interface CheckoutModalProps {
  appointment: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    amount?: number;
  };
  onClose: () => void;
  onConfirmPayment: (appointmentId: string) => Promise<void>;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  appointment,
  onClose,
  onConfirmPayment,
}) => {
  const handlePayment = async () => {
    try {
      await onConfirmPayment(appointment.id);
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-2">Appointment Details</h3>
            <p className="text-gray-600">Date: {new Date(appointment.date).toLocaleDateString()}</p>
            <p className="text-gray-600">Time: {appointment.startTime} - {appointment.endTime}</p>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
            <div className="flex justify-between items-center">
              <span>Service Fee</span>
              <span>${appointment.amount || 100}</span>
            </div>
            <div className="flex justify-between items-center mt-2 font-bold">
              <span>Total</span>
              <span>${appointment.amount || 100}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Payment Method</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="card"
                    name="payment"
                    className="mr-2"
                    checked
                    readOnly
                  />
                  <label htmlFor="card">Credit/Debit Card</label>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Pay ${appointment.amount || 100}
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
