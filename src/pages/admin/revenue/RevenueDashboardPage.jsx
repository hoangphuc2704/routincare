import React, { useState, useEffect } from 'react';
import paymentApi from '../../../services/api/paymentApi';
import SummaryCardsGrid from '../../../components/dashboard/SummaryCardsGrid';
import DateRangeFilter from '../../../components/dashboard/DateRangeFilter';
import RevenueLineChart from '../../../components/dashboard/charts/RevenueLineChart';
import RevenueBarChart from '../../../components/dashboard/charts/RevenueBarChart';
import TopPlansDonutChart from '../../../components/dashboard/charts/TopPlansDonutChart';
import { SkeletonCardGrid, SkeletonChartGrid } from '../../../components/SkeletonLoader';
import { getDateRange } from '../../../utils/revenueChartUtils';
import {
  mockSummaryData,
  mockRevenueByMonth,
  mockRevenueByPlan,
  mockTopPlans,
} from '../../../utils/mockRevenueData';

// Toggle to USE_MOCK_DATA = true if API is not working
const USE_MOCK_DATA = false;

/**
 * RevenueDashboard - Main admin revenue dashboard page
 */
const RevenueDashboard = () => {
  // State management
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [summaryData, setSummaryData] = useState(null);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [revenueByPlan, setRevenueByPlan] = useState([]);
  const [topPlans, setTopPlans] = useState([]);

  // Individual loading states for better UX
  const [loadingStates, setLoadingStates] = useState({
    summary: true,
    monthly: true,
    byPlan: true,
    topPlans: true,
  });

  /**
   * Fetch all dashboard data
   */
  const fetchDashboardData = async (range) => {
    try {
      setError(null);
      setLoading(true);

      // Use mock data if USE_MOCK_DATA flag is true
      if (USE_MOCK_DATA) {
        console.log('Using mock data for testing');
        setSummaryData(mockSummaryData);
        setRevenueByMonth(mockRevenueByMonth);
        setRevenueByPlan(mockRevenueByPlan);
        setTopPlans(mockTopPlans);
        setLoadingStates({ summary: false, monthly: false, byPlan: false, topPlans: false });
        setLoading(false);
        return;
      }

      // Get date range parameters and transform to backend format
      const dateRange = getDateRange(range);
      const queryParams = {
        fromDate: dateRange.from,
        toDate: dateRange.to,
      };

      // Fetch all data in parallel
      const [summaryRes, monthlyRes, planRes, topRes] = await Promise.all([
        paymentApi.getRevenueSummary(queryParams),
        paymentApi.getRevenueByMonth(queryParams),
        paymentApi.getRevenueByPlan(queryParams),
        paymentApi.getTopPlans({ ...queryParams, top: 5 }),
      ]);

      // Debug logging
      console.log('API Responses:', { summaryRes, monthlyRes, planRes, topRes });
      console.log('Raw Response Data:', {
        summaryData: summaryRes?.data,
        monthlyData: monthlyRes?.data,
        planData: planRes?.data,
        topData: topRes?.data,
      });

      // Update state with fetched data - ensure arrays
      // Axios wraps response in .data, so backend data is in .data.data
      const summary = summaryRes?.data?.data || {};
      console.log('✅ Summary data extracted:', summary);
      setSummaryData(summary);

      // Extract arrays from backend response structure
      // Axios wraps backend response in response.data, so we need to go one level deeper:
      // response.data = { success: true, data: { items: [...] }, message: "" }

      // Backend: /by-month returns { data: { items: [...], ... } }
      const monthlyData = monthlyRes?.data?.data?.items || [];
      console.log('✅ Monthly data extracted, length:', monthlyData.length, monthlyData);

      // Backend: /by-plan returns { data: { plans: [...], ... } }
      const planData = planRes?.data?.data?.plans || [];
      console.log('✅ Plan data extracted, length:', planData.length, planData);

      // Backend: /top-plans returns { data: [...] } - direct array in response.data.data
      const topData = Array.isArray(topRes?.data?.data) ? topRes.data.data : [];
      console.log('✅ Top plans data extracted, length:', topData.length, topData);

      // Transform data to match chart component expectations
      // Backend uses lowercase field names: revenue, planName, label
      const transformedMonthly = monthlyData.map((item) => ({
        ...item,
        amount: item.revenue,
      }));

      // Plans: rename planName -> name, revenue -> amount
      const transformedPlans = planData.map((item) => ({
        ...item,
        name: item.planName,
        amount: item.revenue,
      }));

      // Top plans: same transformation
      const transformedTopPlans = topData.map((item) => ({
        ...item,
        name: item.planName,
        amount: item.revenue,
      }));

      setRevenueByMonth(transformedMonthly);
      setRevenueByPlan(transformedPlans);
      setTopPlans(transformedTopPlans);

      console.log('Final Processed Data:', {
        monthlyData: transformedMonthly.length,
        planData: transformedPlans.length,
        topData: transformedTopPlans.length,
      });

      setLoadingStates({
        summary: false,
        monthly: false,
        byPlan: false,
        topPlans: false,
      });

      console.log('✅ State updated successfully');
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu doanh thu. Vui lòng thử lại.');
      setLoadingStates({
        summary: false,
        monthly: false,
        byPlan: false,
        topPlans: false,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial data fetch on component mount
   */
  useEffect(() => {
    fetchDashboardData(dateRange);
  }, []);

  /**
   * Monitor state changes for debugging
   */
  useEffect(() => {
    console.log('📊 State Updated:', {
      summaryData,
      revenueByMonth: revenueByMonth.length,
      revenueByPlan: revenueByPlan.length,
      topPlans: topPlans.length,
      loading,
      loadingStates,
    });
  }, [summaryData, revenueByMonth, revenueByPlan, topPlans, loading, loadingStates]);

  /**
   * Refetch data when date range changes
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingStates({
        summary: true,
        monthly: true,
        byPlan: true,
        topPlans: true,
      });
      fetchDashboardData(dateRange);
    }, 300); // Debounce to prevent multiple rapid requests

    return () => clearTimeout(timer);
  }, [dateRange]);

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  /**
   * Handle retry action
   */
  const handleRetry = () => {
    fetchDashboardData(dateRange);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--admin-bg)' }}>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3"
          style={{ color: 'var(--admin-text)' }}
        >
          <span className="text-4xl">💹</span>
          Bảng điều khiển doanh thu
        </h1>
        <p className="text-sm sm:text-base" style={{ color: 'var(--admin-text-secondary)' }}>
          Track your platform's financial performance in real-time
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="mb-6 border rounded-lg p-4 animate-pulse"
          style={{ backgroundColor: 'var(--admin-error-bg)', borderColor: 'var(--admin-error)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--admin-error)' }}>
                  Error Loading Data
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--admin-error)' }}>
                  {error}
                </p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-200"
              style={{ backgroundColor: 'var(--admin-error)' }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <DateRangeFilter onRangeChange={handleDateRangeChange} defaultRange={dateRange} />

      {/* Summary Cards */}
      <div className="mb-8">
        {loading ? (
          <SkeletonCardGrid count={4} />
        ) : (
          <SummaryCardsGrid data={summaryData} loading={loadingStates.summary} />
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Line Chart */}
        <div className="lg:col-span-2">
          <RevenueLineChart
            data={revenueByMonth}
            summaryData={summaryData}
            loading={loadingStates.monthly}
          />
        </div>

        {/* Revenue by Plan Bar Chart */}
        <div>
          <RevenueBarChart data={revenueByPlan} loading={loadingStates.byPlan} />
        </div>

        {/* Top Plans Donut Chart */}
        {/* <div>
          <TopPlansDonutChart data={topPlans} loading={loadingStates.topPlans} />
        </div> */}
      </div>

      {/* Footer Statistics */}
      {!loading && (
        <div
          className="rounded-xl p-6 text-center text-sm"
          style={{
            backgroundColor: 'var(--admin-card)',
            borderColor: 'var(--admin-border)',
            border: '1px solid',
            color: 'var(--admin-text-secondary)',
          }}
        >
          <p>
            📊 Showing data for:{' '}
            <span className="font-semibold" style={{ color: 'var(--accent)' }}>
              {dateRange === '30days' ? 'Last 30 Days' : '1 Year'}
            </span>
          </p>
          <p className="mt-2 text-xs">Last updated: {new Date().toLocaleString()}</p>
        </div>
      )}

      {/* CSS for fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RevenueDashboard;
