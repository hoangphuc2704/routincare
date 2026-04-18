import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { parseMonth, getChartColors, formatVND } from '../../../utils/revenueChartUtils';
import SkeletonLoader from '../../../components/SkeletonLoader';

/**
 * RevenueLineChart - Displays revenue trend over months
 */
const RevenueLineChart = ({ data = [], loading = false }) => {
  const [chartState, setChartState] = useState({
    series: [],
    options: {},
  });

  useEffect(() => {
    console.log('📈 RevenueLineChart data received:', data);
    const safeData = Array.isArray(data) ? data : [];

    if (!safeData || safeData.length === 0) {
      console.log('⚠️ RevenueLineChart: No data provided');
      setChartState({
        series: [{ name: 'Doanh thu', data: [] }],
        options: getLineChartOptions([]),
      });
      return;
    }

    // Use label from backend, or fallback to parsed month
    const months = safeData.map(
      (item) => item.label || `${item.year}-${String(item.month).padStart(2, '0')}`
    );
    const revenues = safeData.map((item) => item.amount || item.revenue || 0);

    setChartState({
      series: [
        {
          name: 'Doanh thu (VND)',
          data: revenues,
        },
      ],
      options: getLineChartOptions(months),
    });
  }, [data]);

  const getLineChartOptions = (categories) => ({
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
        autoSelected: 'zoom',
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
    colors: ['#3b82f6'],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '75%',
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
          fontSize: '12px',
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
      x: {
        show: true,
      },
    },
    legend: {
      labels: {
        colors: '#d1d5db',
      },
      markers: {
        radius: 5,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 250,
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
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <span>📈</span> Xu hướng doanh thu
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

export default RevenueLineChart;
