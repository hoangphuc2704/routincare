import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { formatVND, getChartColors } from '../../../utils/revenueChartUtils';
import SkeletonLoader from '../../../components/SkeletonLoader';

/**
 * TopPlansDonutChart - Displays top plans distribution in a donut chart
 */
const TopPlansDonutChart = ({ data = [], loading = false }) => {
  const [chartState, setChartState] = useState({
    series: [],
    options: {},
  });

  useEffect(() => {
    console.log('🎯 TopPlansDonutChart data received:', data);
    const safeData = Array.isArray(data) ? data : [];

    if (!safeData || safeData.length === 0) {
      console.log('⚠️ TopPlansDonutChart: No data provided');
      setChartState({
        series: [],
        options: getDonutChartOptions([]),
      });
      return;
    }

    const plans = safeData.map((item) => item.name || item.planName);
    const revenues = safeData.map((item) => item.amount || item.revenue || 0);

    setChartState({
      series: revenues,
      options: getDonutChartOptions(plans),
    });
  }, [data]);

  const getDonutChartOptions = (labels) => ({
    chart: {
      background: '#111827',
      toolbar: {
        show: true,
        tools: {
          download: true,
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
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    labels: labels,
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: '#d1d5db',
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: '#f3f4f6',
              formatter: function (val) {
                return formatVND(val, false);
              },
              offsetY: 5,
            },
            total: {
              show: true,
              label: 'Total Revenue',
              fontSize: '14px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: '#d1d5db',
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return formatVND(total);
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '11px',
        colors: '#f3f4f6',
      },
      dropshadow: {
        enabled: false,
      },
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
      position: 'bottom',
      labels: {
        colors: '#d1d5db',
      },
      markers: {
        radius: 5,
      },
      fontSize: '12px',
      fontFamily: 'Helvetica, Arial, sans-serif',
      onItemClick: {
        toggleDataSeries: false,
      },
      formatter: function (seriesName, opts) {
        const value = opts.w.globals.series[opts.seriesIndex];
        return [seriesName, ' - ', formatVND(value)];
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 350,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 300,
          },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  name: {
                    fontSize: '12px',
                  },
                  value: {
                    fontSize: '14px',
                  },
                },
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
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <span>🎯</span> Top Plans Distribution
      </h3>
      {chartState.series && chartState.series.length > 0 ? (
        <div className="overflow-x-auto">
          <Chart
            options={chartState.options}
            series={chartState.series}
            type="donut"
            height={380}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-80 text-gray-400">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
};

export default TopPlansDonutChart;
