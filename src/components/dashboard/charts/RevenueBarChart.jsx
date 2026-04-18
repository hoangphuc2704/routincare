import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { truncateText, formatVND, getChartColors } from '../../../utils/revenueChartUtils';
import SkeletonLoader from '../../SkeletonLoader';

/**
 * RevenueBarChart - Displays revenue by plan in a bar chart
 */
const RevenueBarChart = ({ data = [], loading = false }) => {
  const [chartState, setChartState] = useState({
    series: [],
    options: {},
  });

  useEffect(() => {
    console.log('📊 RevenueBarChart data received:', data);
    const safeData = Array.isArray(data) ? data : [];

    if (!safeData || safeData.length === 0) {
      console.log('⚠️ RevenueBarChart: No data provided');
      setChartState({
        series: [{ name: 'Doanh thu', data: [] }],
        options: getBarChartOptions([]),
      });
      return;
    }

    const plans = safeData.map((item) => truncateText(item.name || item.planName, 12));
    const revenues = safeData.map((item) => item.amount || item.revenue || 0);

    setChartState({
      series: [
        {
          name: 'Doanh thu (VND)',
          data: revenues,
        },
      ],
      options: getBarChartOptions(plans),
    });
  }, [data]);

  const getBarChartOptions = (categories) => ({
    chart: {
      background: '#111827',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
        },
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 150,
        },
      },
    },
    colors: ['#10b981'],
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 6,
        columnWidth: '70%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#d1d5db',
          fontSize: '11px',
        },
      },
      axisBorder: {
        color: '#374151',
      },
      axisTicks: {
        color: '#374151',
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#d1d5db',
          fontSize: '12px',
        },
        formatter: (value) => {
          return formatVND(value, false);
        },
      },
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: (value) => formatVND(value),
      },
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 320,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 280,
          },
          plotOptions: {
            bar: {
              columnWidth: '75%',
            },
          },
          xaxis: {
            labels: {
              style: {
                fontSize: '10px',
              },
            },
          },
        },
      },
    ],
  });

  if (loading) {
    return <SkeletonLoader type="chart" height="h-80" />;
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <span>📊</span> Doanh thu theo gói
      </h3>
      {chartState.series &&
      chartState.series[0] &&
      chartState.series[0].data &&
      chartState.series[0].data.length > 0 ? (
        <div className="overflow-x-auto">
          <Chart options={chartState.options} series={chartState.series} type="bar" height={350} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-80 text-gray-400">
          <p>Không có dữ liệu</p>
        </div>
      )}
    </div>
  );
};

export default RevenueBarChart;
