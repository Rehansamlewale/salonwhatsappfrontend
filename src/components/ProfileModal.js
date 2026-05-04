import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';
import { FaTimes, FaEnvelope, FaPhone } from 'react-icons/fa';

const ProfileModal = ({ isOpen, onClose }) => {
  const { employeeData, currentUser } = useAuth();
  const [adminData, setAdminData] = useState(null);

  // Fetch admin data from Firebase
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!currentUser?.uid || employeeData) {
        // If employee data exists, use that instead
        return;
      }

      try {
        const adminRef = ref(database, `admins/${currentUser.uid}`);
        const snapshot = await get(adminRef);

        if (snapshot.exists()) {
          setAdminData(snapshot.val());
        }
      } catch (error) {
        
      }
    };

    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen, currentUser, employeeData]);

  if (!isOpen) return null;

  // Determine data source: Employee Data > Admin Data > Current User fallback
  const name = employeeData?.name || adminData?.name || currentUser?.displayName || 'User';
  const email = employeeData?.email || adminData?.email || currentUser?.email || '';
  const mobile = employeeData?.mobile || adminData?.number || 'N/A';
  const role = employeeData?.role || 'Admin'; // Default to admin if no role found

  // Map Agent to Employee for display
  const displayRole = role === 'Agent' ? 'Employee' : role;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes size={20} />
        </button>

        {/* Header / Avatar */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-3xl">
            {name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{name}</h2>
          <span className="inline-block mt-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wide">
            {displayRole}
          </span>
        </div>

        {/* Details List */}
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm mr-4">
              <FaEnvelope size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
              <p className="text-sm text-gray-800 font-medium break-all">{email}</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm mr-4">
              <FaPhone size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Mobile</p>
              <p className="text-sm text-gray-800 font-medium">{mobile}</p>
            </div>
          </div>


        </div>

        {/* Close Action */}
        <button
          onClick={onClose}
          className="w-full mt-8 bg-gray-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors shadow-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
