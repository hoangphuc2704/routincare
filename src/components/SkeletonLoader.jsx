import React from 'react';

/**
 * SkeletonLoader - Animated skeleton loading component
 * Used as placeholder while fetching data
 */
const SkeletonLoader = ({ type = 'card', count = 1, height = 'h-32' }) => {
  // Skeleton for summary card
  if (type === 'card') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-500 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-500 rounded w-40"></div>
            <div className="h-3 bg-gray-500 rounded w-28 mt-3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Skeleton for chart
  if (type === 'chart') {
    return (
      <div className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-500 rounded w-32 mb-6"></div>
        <div className={`${height} bg-gray-500 rounded mb-4`}></div>
        <div className="flex justify-around">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3 bg-gray-500 rounded w-12"></div>
          ))}
        </div>
      </div>
    );
  }

  // Skeleton for filter bar
  if (type === 'filter') {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse space-y-3">
        <div className="h-10 bg-gray-600 rounded w-48"></div>
      </div>
    );
  }

  return null;
};

/**
 * SkeletonCardGrid - Grid of skeleton cards
 */
export const SkeletonCardGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg p-6 animate-pulse"
      >
        <div className="h-4 bg-gray-500 rounded w-24 mb-4"></div>
        <div className="h-8 bg-gray-500 rounded w-40 mb-4"></div>
        <div className="h-3 bg-gray-500 rounded w-28"></div>
      </div>
    ))}
  </div>
);

/**
 * SkeletonChartGrid - Grid of skeleton charts
 */
export const SkeletonChartGrid = ({ cols = 2, rows = 2 }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-6`}>
    {Array.from({ length: cols * rows }).map((_, i) => (
      <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-600 rounded w-32 mb-6"></div>
        <div className="h-64 bg-gray-600 rounded mb-4"></div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;
