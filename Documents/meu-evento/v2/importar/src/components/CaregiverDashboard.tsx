import React, { useState, useEffect } from 'react';
    import { db } from '../firebase';
    import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
    import { useAuth } from '../context/AuthContext';
    import { useNavigate } from 'react-router-dom';
    import { signOut } from 'firebase/auth';
    import { auth } from '../firebase';
    import {
      CheckCircleIcon,
      XCircleIcon,
      ClockIcon,
      ArrowRightOnRectangleIcon,
    } from '@heroicons/react/24/solid';

    interface HireRequest {
      id: string;
      clientId: string;
      caregiverId: string;
      category: string;
      date: string;
      time: string;
      description: string;
      status: 'pending' | 'confirmed' | 'rejected' | 'completed';
      createdAt: any;
    }

    const CaregiverDashboard: React.FC = () => {
      const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
      const { currentUser } = useAuth();
      const navigate = useNavigate();

      useEffect(() => {
        if (!currentUser) {
          navigate('/login');
          return;
        }

        const hireRequestsRef = collection(db, 'hireRequests');
        const unsubscribe = onSnapshot(hireRequestsRef, (snapshot) => {
          const requests: HireRequest[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as HireRequest));
          setHireRequests(requests);
        });

        return () => unsubscribe();
      }, [currentUser, navigate]);

      const handleAccept = async (id: string) => {
        const requestRef = doc(db, 'hireRequests', id);
        await updateDoc(requestRef, { status: 'confirmed' });
      };

      const handleReject = async (id: string) => {
        const requestRef = doc(db, 'hireRequests', id);
        await updateDoc(requestRef, { status: 'rejected' });
      };

      const handleComplete = async (id: string) => {
        const requestRef = doc(db, 'hireRequests', id);
        await updateDoc(requestRef, { status: 'completed' });
      };

      const handleLogout = async () => {
        try {
          await signOut(auth);
          navigate('/login');
        } catch (error) {
          console.error('Error logging out:', error);
        }
      };

      return (
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Caregiver Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
          {hireRequests.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b">Client ID</th>
                    <th className="py-2 px-4 border-b">Category</th>
                    <th className="py-2 px-4 border-b">Date</th>
                    <th className="py-2 px-4 border-b">Time</th>
                    <th className="py-2 px-4 border-b">Description</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hireRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">{request.clientId}</td>
                      <td className="py-2 px-4 border-b">{request.category}</td>
                      <td className="py-2 px-4 border-b">{request.date}</td>
                      <td className="py-2 px-4 border-b">{request.time}</td>
                      <td className="py-2 px-4 border-b">{request.description}</td>
                      <td className="py-2 px-4 border-b">
                        {request.status === 'pending' && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        )}
                        {request.status === 'confirmed' && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Confirmed
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            <XCircleIcon className="h-3 w-3 mr-1" />
                            Rejected
                          </span>
                        )}
                        {request.status === 'completed' && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(request.id)}
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {request.status === 'confirmed' && (
                          <button
                            onClick={() => handleComplete(request.id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    };

    export default CaregiverDashboard;
