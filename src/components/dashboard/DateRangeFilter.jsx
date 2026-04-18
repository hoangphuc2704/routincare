import React, { useState } from 'react';

/**
 * DateRangeFilter - Component to filter revenue data by date range
 */
const DateRangeFilter = ({ onRangeChange = () => {}, defaultRange = '30days' }) => {
  const [selectedRange, setSelectedRange] = useState(defaultRange);

  const ranges = [
    // { value: '7days', label: 'Last 7 Days', icon: '📅' },
    { value: '30days', label: 'Last 30 Days', icon: '📊' },
    { value: '1year', label: '1 Year', icon: '📈' },
  ];

  const handleRangeChange = (range) => {
    setSelectedRange(range);
    onRangeChange(range);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 mb-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          📅 Lọc theo khoảng thời gian
        </h3>

        <div className="flex items-center gap-3 flex-wrap">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleRangeChange(range.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                selectedRange === range.value
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              <span>{range.icon}</span>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        {selectedRange === '7days' && '⏱️ Hiển thị dữ liệu của 7 ngày gần đây'}
        {selectedRange === '30days' && '⏱️ Hiển thị dữ liệu của 30 ngày gần đây'}
        {selectedRange === '1year' && '⏱️ Hiển thị dữ liệu của 1 năm gần đây'}
      </div>
    </div>
  );
};

export default DateRangeFilter;
