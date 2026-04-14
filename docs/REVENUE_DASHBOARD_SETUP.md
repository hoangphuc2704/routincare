# Revenue Dashboard - Setup & Implementation Guide

## 📋 Overview

This is a production-ready admin Revenue Dashboard built with React, TailwindCSS, and ApexCharts. It provides comprehensive revenue analytics with charts, summary cards, and date filtering capabilities.

## 📦 Prerequisites

Ensure you have the following dependencies installed in your `package.json`:

```bash
npm install react-apexcharts apexcharts axios
```

If not already installed, add them:

```bash
npm install react-apexcharts apexcharts
npm install axios (if not already present)
```

## 🗂️ File Structure

```
src/
├── api/
│   └── paymentApi.jsx              # Payment API service (updated)
├── components/
│   ├── SkeletonLoader.jsx          # Skeleton loading components
│   └── dashboard/
│       ├── SummaryCardsGrid.jsx    # Summary metrics cards
│       ├── DateRangeFilter.jsx     # Date range selector
│       └── charts/
│           ├── RevenueLineChart.jsx       # Area chart - revenue trends
│           ├── RevenueBarChart.jsx        # Bar chart - revenue by plan
│           └── TopPlansDonutChart.jsx     # Donut chart - top plans
├── page/
│   └── RevenueDashboard.jsx        # Main dashboard page
├── utils/
│   └── revenueChartUtils.js        # Utility functions (new)
└── service/
    └── axiosClient.js            # Axios client setup
```

## 🚀 Usage

### 1. Import and Route Setup

Add the dashboard to your router configuration:

```jsx
import RevenueDashboard from './page/RevenueDashboard';

// In your router configuration
{
  path: '/admin/revenue-dashboard',
  element: <RevenueDashboard />
}
```

### 2. API Setup

Ensure your backend is configured to handle these endpoints:

```
GET /api/payments/revenue/summary
→ Response: {
    totalRevenue: 1000000,
    totalTransactions: 500,
    todayRevenue: 50000,
    monthlyRevenue: 200000,
    revenueTrend: 5,        // Optional: percentage trend
    transactionTrend: 3,
    todayTrend: 2,
    monthlyTrend: 8
  }

GET /api/payments/revenue/by-month?from=2026-01-01&to=2026-03-14
→ Response: [
    { month: "2026-01", amount: 100000 },
    { month: "2026-02", amount: 150000 },
    { month: "2026-03", amount: 120000 }
  ]

GET /api/payments/revenue/by-plan?from=2026-01-01&to=2026-03-14
→ Response: [
    { planName: "Pro", revenue: 500000 },
    { planName: "Basic", revenue: 300000 },
    { planName: "Enterprise", revenue: 700000 }
  ]

GET /api/payments/revenue/top-plans?from=2026-01-01&to=2026-03-14
→ Response: [
    { planName: "Enterprise", revenue: 700000 },
    { planName: "Pro", revenue: 500000 }
  ]
```

## 🎨 Features

### Summary Cards

- Total Revenue
- Total Transactions
- Today Revenue
- Monthly Revenue
- Optional trend indicators (↑↓ percentage)

### Charts

1. **Revenue Trend (Line Chart)**
   - Shows revenue progression over months
   - Smooth animations
   - Hover tooltips with VND formatting

2. **Revenue by Plan (Bar Chart)**
   - Compares revenue across different plans
   - Color-coded bars
   - Interactive toolbar

3. **Top Plans (Donut Chart)**
   - Distribution visualization
   - Center total display
   - Legend with formatted values

### Advanced Features

- **Date Range Filtering**: Select 7 days, 30 days, or 1 year
- **Currency Formatting**: Automatic VND formatting with thousand separators
- **Skeleton Loading**: Smooth loading states while fetching
- **Error Handling**: User-friendly error messages with retry option
- **Animations**: Smooth chart animations and transitions
- **Responsive Design**: Mobile, tablet, and desktop support
- **Dark Theme**: Modern dark dashboard aesthetic

## 🎯 Utility Functions

### `revenueChartUtils.js`

#### formatVND(value, showSymbol = true)

```jsx
formatVND(1000000); // "1,000,000 ₫"
formatVND(1000000, false); // "1,000,000"
```

#### formatShortNumber(value)

```jsx
formatShortNumber(1500000); // "1.5M"
formatShortNumber(950); // "950"
```

#### getDateRange(range)

```jsx
getDateRange('30days'); // { from: "2026-02-12", to: "2026-03-14" }
getDateRange('7days'); // { from: "2026-03-07", to: "2026-03-14" }
```

#### parseMonth(monthStr)

```jsx
parseMonth('2026-01'); // "Jan 2026"
```

#### getDarkThemeColors

```jsx
// Predefined color palette
{
  primary: '#3b82f6',      // Blue
  secondary: '#10b981',    // Green
  accent: '#f59e0b',       // Amber
  danger: '#ef4444',       // Red
  // ... more colors
}
```

## 🛠️ Customization

### Change Color Theme

Edit `revenueChartUtils.js`:

```jsx
export const getChartColors = () => ({
  series: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  // Change these colors for different theme
});
```

### Customize Chart Height

In chart component files:

```jsx
<Chart
  options={chartState.options}
  series={chartState.series}
  type="area"
  height={350} // Change this value
/>
```

### Add Custom Metrics

In [RevenueDashboard.jsx](RevenueDashboard.jsx#L1), add new API calls:

```jsx
const [customData, setCustomData] = useState(null);

// In fetchDashboardData function
const customRes = await paymentApi.getCustomMetric();
setCustomData(customRes.data);
```

### Modify Date Ranges

In [DateRangeFilter.jsx](DateRangeFilter.jsx):

```jsx
const ranges = [
  { value: '7days', label: 'Last 7 Days', icon: '📅' },
  { value: '30days', label: 'Last 30 Days', icon: '📊' },
  { value: '1year', label: '1 Year', icon: '📈' },
  // Add custom ranges here
];
```

## 📊 Component Props

### SummaryCardsGrid

```jsx
<SummaryCardsGrid
  data={{
    totalRevenue: 1000000,
    totalTransactions: 500,
    todayRevenue: 50000,
    monthlyRevenue: 200000,
    revenueTrend: 5,
    transactionTrend: 3,
  }}
  loading={false}
/>
```

### RevenueLineChart

```jsx
<RevenueLineChart
  data={[
    { month: '2026-01', amount: 100000 },
    { month: '2026-02', amount: 150000 },
  ]}
  loading={false}
/>
```

### RevenueBarChart

```jsx
<RevenueBarChart
  data={[
    { planName: 'Pro', revenue: 500000 },
    { planName: 'Basic', revenue: 300000 },
  ]}
  loading={false}
/>
```

### TopPlansDonutChart

```jsx
<TopPlansDonutChart
  data={[
    { planName: 'Enterprise', revenue: 700000 },
    { planName: 'Pro', revenue: 500000 },
  ]}
  loading={false}
/>
```

### DateRangeFilter

```jsx
<DateRangeFilter onRangeChange={(range) => console.log(range)} defaultRange="30days" />
```

## 🔄 State Management

The dashboard uses React hooks for state management:

```jsx
const [dateRange, setDateRange] = useState('30days');
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [summaryData, setSummaryData] = useState(null);
const [revenueByMonth, setRevenueByMonth] = useState([]);
const [revenueByPlan, setRevenueByPlan] = useState([]);
const [topPlans, setTopPlans] = useState([]);
const [loadingStates, setLoadingStates] = useState({
  summary: true,
  monthly: true,
  byPlan: true,
  topPlans: true,
});
```

## 🚨 Error Handling

The dashboard includes comprehensive error handling:

```jsx
try {
  const data = await paymentApi.getRevenueSummary();
  setSummaryData(data);
} catch (err) {
  setError(err.response?.data?.message || 'Failed to load data');
}
```

Users can retry failed requests:

```jsx
<button onClick={handleRetry}>Retry</button>
```

## ⚡ Performance Optimization

1. **Parallel API Calls**: All data fetched simultaneously using Promise.all()
2. **Debounced Filters**: Date range changes debounced by 300ms
3. **Individual Loading States**: Charts load independently
4. **Optimized Animations**: CSS animations for smooth performance
5. **Responsive Images & Charts**: Mobile-optimized rendering

## 🎨 Styling

Dashboard uses TailwindCSS dark theme:

- **Background**: Gray 900 with gradient
- **Cards**: Gray 800 with hover effects
- **Text**: Gray 100 for primary, Gray 300 for secondary
- **Accents**: Blue, Green, Amber, Purple
- **Borders**: Gray 700 with 50% opacity

### Custom Dark Theme Colors

```jsx
bg - gray - 900; // Primary dark background
bg - gray - 800; // Card background
text - white; // Primary text
text - gray - 400; // Secondary text
```

## 📱 Responsive Breakpoints

```jsx
// Mobile (< 640px)
// Tablet (640px - 1024px)
// Desktop (> 1024px)
```

Charts automatically adjust:

- Height changes on smaller screens
- Font sizes scale appropriately
- Grid layouts stack on mobile

## 🔒 Security Considerations

1. **API Keys**: Store in environment variables
2. **CORS**: Configure backend CORS policy
3. **Authentication**: Ensure API calls are authenticated
4. **Data Validation**: Validate API responses
5. **Error Messages**: Don't expose sensitive data in errors

## 📝 Example Integration

```jsx
// In your App.jsx or Router
import RevenueDashboard from './page/RevenueDashboard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/revenue" element={<RevenueDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## 🐛 Troubleshooting

### Charts not rendering

- Ensure `react-apexcharts` and `apexcharts` are installed
- Check console for errors
- Verify API endpoints are correct

### Loading states not working

- Check individual `loadingStates` in component
- Verify API calls are completing
- Check for network errors

### Styling not applied

- Ensure TailwindCSS is configured
- Check color classes in components
- Verify CSS file imports

### API errors

- Check backend endpoints match the API calls
- Verify authentication tokens
- Check CORS configuration
- Validate response format

## 📚 ApexCharts Documentation

For advanced customization, refer to:

- [ApexCharts Official Docs](https://apexcharts.com/)
- [React ApexCharts](https://github.com/apexcharts/react-apexcharts)

## 🎯 Best Practices

1. **Always handle loading states** for better UX
2. **Implement proper error boundaries**
3. **Use memo/useMemo** for expensive computations
4. **Optimize API calls** with proper caching
5. **Test responsive behavior** on multiple devices
6. **Monitor performance** using React DevTools

## 📄 License

This dashboard component is production-ready and follows React best practices.
