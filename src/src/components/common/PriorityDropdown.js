import React from 'react';
import { colors } from '../../styles/designTokens';

// Helper function to get priority colors
const getPriorityColors = (priority) => {
    const p = (priority || 'Low').toLowerCase();

    switch (p) {
        case 'high':
            return {
                bg: '#FEE2E2', // red-100
                text: '#991B1B', // red-800
                border: '#F87171' // red-400
            };
        case 'medium':
            return {
                bg: '#FFEDD5', // orange-100
                text: '#9A3412', // orange-800
                border: '#FB923C' // orange-400
            };
        case 'low':
        default:
            return {
                bg: '#DCFCE7', // green-100
                text: '#166534', // green-800
                border: '#4ADE80' // green-400
            };
    }
};

export const PriorityDropdown = ({ value, onChange, options, className = '', ...props }) => {
    const priorityColors = getPriorityColors(value);

    return (
        <select
            value={value || 'Low'}
            onChange={onChange}
            className={`px-3 py-1.5 rounded-lg border text-sm font-semibold focus:ring-2 focus:outline-none cursor-pointer ${className}`}
            style={{
                backgroundColor: priorityColors.bg,
                color: priorityColors.text,
                borderColor: priorityColors.border,
                borderWidth: '1px',
            }}
            {...props}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};
