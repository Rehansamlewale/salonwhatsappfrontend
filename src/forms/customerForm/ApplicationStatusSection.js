import { getStatusOptions, PRIORITY_OPTIONS } from '../loanTypes';
import ActiveDropdown from '../../components/common/ActiveDropdown';

const ApplicationStatusSection = ({ formData, handleChange }) => {
  // Get dynamic status options based on selected loan type
  const statusOptions = getStatusOptions(formData.loanType);

  const handleStatusChange = (value) => {
    handleChange({
      target: {
        name: 'status',
        value: value
      }
    });
  };

  const handlePriorityChange = (value) => {
    handleChange({
      target: {
        name: 'priority',
        value: value
      }
    });
  };

  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-yellow-100 text-yellow-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">📋</span>
        Application Status
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
        <div>
          <ActiveDropdown
            label="Current Status"
            value={formData.status}
            onChange={handleStatusChange}
            options={statusOptions}
            placeholder="Select Status"
          />
        </div>
        <div>
          <ActiveDropdown
            label="Priority"
            value={formData.priority || 'Low'}
            onChange={handlePriorityChange}
            options={PRIORITY_OPTIONS}
            placeholder="Select Priority"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-base font-semibold text-gray-700 mb-2">Remark / Notes</label>
          <textarea
            name="remark"
            value={formData.remark || ''}
            onChange={handleChange}
            rows="3"
            placeholder="Add any additional notes or remarks about this application..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
          ></textarea>
        </div>
      </div>
    </section>
  );
};

export default ApplicationStatusSection;
