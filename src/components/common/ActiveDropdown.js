import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const ActiveDropdown = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = "Select...",
    icon: Icon,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Find the selected option label
    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = selectedOption ? (selectedOption.label || selectedOption.value) : placeholder;

    // Animation classes
    const dropdownClasses = `
    absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 
    overflow-hidden transition-all duration-300 ease-in-out transform origin-top z-50
    ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
  `;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full px-4 py-3 min-h-[50px] flex items-center justify-between gap-3 text-left
          bg-white border-2 border-gray-100 rounded-xl
          hover:border-blue-300 hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500
          transition-all duration-200 group
          ${isOpen ? 'border-blue-500 ring-4 ring-blue-50 shadow-lg' : ''}
        `}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {Icon && (
                        <div className={`
              p-2 rounded-lg transition-colors duration-200
              ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-500 group-hover:text-blue-500 group-hover:bg-blue-50'}
            `}>
                            <Icon className="text-sm" />
                        </div>
                    )}
                    <span className={`block truncate font-medium ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                        {displayValue}
                    </span>
                </div>

                <div className={`
          p-1 rounded-full transition-all duration-300 
          ${isOpen ? 'bg-blue-100 rotate-180' : 'bg-gray-50 group-hover:bg-blue-50'}
        `}>
                    <FaChevronDown className={`
            text-xs transition-colors duration-200
            ${isOpen ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}
          `} />
                </div>
            </button>

            <div className={dropdownClasses}>
                <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${value === option.value
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:pl-4'}
              `}
                        >
                            <span className="truncate">{option.label || option.value}</span>
                            {value === option.value && (
                                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></span>
                            )}
                        </button>
                    ))}
                    {options.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                            No options available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveDropdown;
