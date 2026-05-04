import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 transform transition-all duration-500 animate-slideIn ${type === 'success' ? 'bg-white border-l-4 border-green-500' :
      type === 'info' ? 'bg-white border-l-4 border-blue-500' :
        'bg-white border-l-4 border-red-500'
      }`}>
      {type === 'success' ? (
        <div className="bg-green-100 p-2 rounded-full shrink-0">
          <FaCheckCircle className="text-xl text-green-600" />
        </div>
      ) : type === 'info' ? (
        <div className="bg-blue-100 p-2 rounded-full shrink-0">
          <FaInfoCircle className="text-xl text-blue-600" />
        </div>
      ) : (
        <div className="bg-red-100 p-2 rounded-full shrink-0">
          <FaExclamationTriangle className="text-xl text-red-600" />
        </div>
      )}
      <div>
        <h4 className={`font-bold text-base ${type === 'success' ? 'text-green-800' : type === 'info' ? 'text-blue-800' : 'text-red-800'}`}>
          {type === 'success' ? 'Success' : type === 'info' ? 'Info' : 'Error'}
        </h4>
        <p className="text-gray-600 text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent hover:bg-gray-100 p-1 rounded-full"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
