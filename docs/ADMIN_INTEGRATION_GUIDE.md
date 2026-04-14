# Admin Dashboard Integration Guide

## 🎯 Quick Start Integration

### Step 1: Install Dependencies

If not already installed in your `package.json`:

```bash
npm install react-apexcharts apexcharts
# Ensure axios is also installed
npm install axios
```

### Step 2: Add Route to Admin Panel

Update your admin routes (typically in your Router setup or Admin layout):

```jsx
// In your routing configuration (e.g., routers/adminRoutes.jsx or App.jsx)
import RevenueDashboard from '/page/RevenueDashboard';

const adminRoutes = [
  // ... existing routes
  {
    path: '/admin/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/admin/revenue', // or /admin/revenue-dashboard
    element: <RevenueDashboard />,
  },
  {
    path: '/admin/categories',
    element: <CategoryList />,
  },
  // ... other routes
];
```

### Step 3: Update Navigation Menu

Add link to your admin sidebar navigation:

```jsx
// In your AdminLayout or Sidebar component
<nav className="space-y-2">
  <Link
    to="/admin/revenue"
    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-700"
  >
    <span>💹</span>
    <span>Revenue Dashboard</span>
  </Link>
  {/* Other navigation items */}
</nav>
```

### Step 4: Verify Axiosclien Setup

Ensure your `axiosClient` is properly configured:

```jsx
// src/service/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3005',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token if needed
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
```

## 📁 File Locations Summary

All created files are organized as follows:

| File                     | Location                                                 | Purpose                    |
| ------------------------ | -------------------------------------------------------- | -------------------------- |
| `paymentApi.jsx`         | `src/api/paymentApi.jsx`                                 | API service (updated)      |
| `RevenueDashboard.jsx`   | `src/page/RevenueDashboard.jsx`                          | Main dashboard page        |
| `SummaryCardsGrid.jsx`   | `src/components/dashboard/SummaryCardsGrid.jsx`          | Summary cards              |
| `DateRangeFilter.jsx`    | `src/components/dashboard/DateRangeFilter.jsx`           | Date filter                |
| `RevenueLineChart.jsx`   | `src/components/dashboard/charts/RevenueLineChart.jsx`   | Line chart                 |
| `RevenueBarChart.jsx`    | `src/components/dashboard/charts/RevenueBarChart.jsx`    | Bar chart                  |
| `TopPlansDonutChart.jsx` | `src/components/dashboard/charts/TopPlansDonutChart.jsx` | Donut chart                |
| `SkeletonLoader.jsx`     | `src/components/SkeletonLoader.jsx`                      | Skeleton loading component |
| `revenueChartUtils.js`   | `src/utils/revenueChartUtils.js`                         | Utility functions          |

## 🔌 API Integration Checklist

Before using the dashboard, ensure your backend has these endpoints:

- [ ] `GET /api/payments/revenue/summary`
- [ ] `GET /api/payments/revenue/by-month`
- [ ] `GET /api/payments/revenue/by-plan`
- [ ] `GET /api/payments/revenue/top-plans`

**Note**: All endpoints accept optional query parameters: `from` and `to` (date range in YYYY-MM-DD format)

### Sample Backend Response Format

```javascript
// GET /api/payments/revenue/summary
{
  "totalRevenue": 1500000,
  "totalTransactions": 250,
  "todayRevenue": 45000,
  "monthlyRevenue": 450000
}

// GET /api/payments/revenue/by-month
[
  { "month": "2026-01", "amount": 100000 },
  { "month": "2026-02", "amount": 150000 },
  { "month": "2026-03", "amount": 120000 }
]

// GET /api/payments/revenue/by-plan
[
  { "planName": "Pro", "revenue": 500000 },
  { "planName": "Basic", "revenue": 300000 },
  { "planName": "Enterprise", "revenue": 700000 }
]

// GET /api/payments/revenue/top-plans
[
  { "planName": "Enterprise", "revenue": 700000 },
  { "planName": "Pro", "revenue": 500000 },
  { "planName": "Basic", "revenue": 300000 }
]
```

## 🎨 Styling & Customization

### Using Existing Tailwind Config

The dashboard uses TailwindCSS dark theme colors:

```jsx
// Dark theme colors used throughout:
-bg -
  gray -
  900 - // Main background
  bg -
  gray -
  800 - // Card backgrounds
  text -
  white - // Primary text
  text -
  gray -
  400 - // Secondary text
  border -
  gray -
  700; // Borders
```

If your project uses a different theme, update the color classes in:

1. `RevenueDashboard.jsx` - main page styling
2. `SummaryCardsGrid.jsx` - card styling
3. Chart components - chart container styling

### Custom Color Scheme

To customize colors, edit `revenueChartUtils.js`:

```jsx
export const getDarkThemeColors = {
  primary: '#3b82f6', // Change primary color
  secondary: '#10b981', // Change secondary color
  // ... update other colors
};
```

## 🔐 Environment Variables

Create or update your `.env` file:

```env
REACT_APP_API_URL=http://localhost:3005
REACT_APP_AUTH_TOKEN=your_auth_token_here
```

Then use in axiosClient:

```jsx
const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});
```

## 📊 Data Flow Diagram

```
RevenueDashboard
├── fetchDashboardData()
│   ├── paymentApi.getRevenueSummary()
│   ├── paymentApi.getRevenueByMonth()
│   ├── paymentApi.getRevenueByPlan()
│   └── paymentApi.getTopPlans()
│
├── SummaryCardsGrid (displays summary data)
├── RevenueLineChart (displays monthly trends)
├── RevenueBarChart (displays plan breakdown)
└── TopPlansDonutChart (displays distribution)
```

## 🚀 Performance Tips

1. **API Caching**: Consider implementing caching for API responses

```jsx
const cache = new Map();

const getCachedData = async (key, fetcher) => {
  if (cache.has(key)) return cache.get(key);
  const data = await fetcher();
  cache.set(key, data);
  return data;
};
```

2. **Memoization**: Use React.memo for chart components

```jsx
export default React.memo(RevenueLineChart);
```

3. **Lazy Loading**: Load charts on demand

```jsx
const RevenueLineChart = lazy(() => import('./RevenueLineChart'));
```

## 🧪 Testing Examples

### Test Summary Cards Rendering

```jsx
import SummaryCardsGrid from '../components/dashboard/SummaryCardsGrid';

test('renders summary cards with data', () => {
  const data = {
    totalRevenue: 1000000,
    totalTransactions: 500,
  };
  render(<SummaryCardsGrid data={data} loading={false} />);
  expect(screen.getByText('Total Revenue')).toBeInTheDocument();
});
```

### Test Chart Data

```jsx
test('renders line chart with correct data', () => {
  const data = [{ month: '2026-01', amount: 100000 }];
  render(<RevenueLineChart data={data} loading={false} />);
  expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
});
```

## 🆘 Common Issues & Solutions

### Issue: "Module not found" for ApexCharts

**Solution**:

```bash
npm install react-apexcharts apexcharts --save
```

### Issue: API returns 401 (Unauthorized)

**Solution**: Ensure authentication token is sent:

```jsx
// In axiosClient.js
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Issue: Charts display incorrectly on mobile

**Solution**: Charts have responsive breakpoints already configured, ensure viewport meta tag exists:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Issue: Date range filter not working

**Solution**: Verify `getDateRange()` function returns correct date format:

```jsx
console.log(getDateRange('30days'));
// Should output: { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
```

## 📈 Advanced Customization

### Add Real-time Updates

```jsx
// In RevenueDashboard.jsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchDashboardData(dateRange);
  }, 60000); // Refresh every 60 seconds

  return () => clearInterval(interval);
}, [dateRange]);
```

### Add Export Functionality

```jsx
const handleExportData = () => {
  const csvContent = convertToCSV(revenueByMonth);
  downloadCSV(csvContent, 'revenue-data.csv');
};
```

### Add Chart Comparison

```jsx
// Store previous period data and compare
const [previousData, setPreviousData] = useState(null);
const comparison = calculateComparison(summaryData, previousData);
```

## 📞 Support & Documentation

- ApexCharts: https://apexcharts.com/docs/
- TailwindCSS: https://tailwindcss.com/docs/
- React: https://react.dev/
- Axios: https://axios-http.com/

## ✅ Pre-Deployment Checklist

- [ ] All API endpoints configured and working
- [ ] Authentication tokens properly set
- [ ] CORS configured on backend
- [ ] Error handling implemented
- [ ] Loading states tested
- [ ] Responsive design verified on mobile
- [ ] Colors/styling matches admin theme
- [ ] Performance optimized (no console errors)
- [ ] Environment variables set
- [ ] Documentation updated for team

## 🎓 Component Architecture

```
RevenueDashboard (Container)
├── DateRangeFilter (Filter UI)
├── SummaryCardsGrid (Statistics)
│   └── SummaryCard x4
├── RevenueLineChart (Visualization)
├── RevenueBarChart (Visualization)
└── TopPlansDonutChart (Visualization)

Utilities Layer:
├── revenueChartUtils (Formatters & Helpers)
├── SkeletonLoader (Loading States)
└── paymentApi (API Calls)
```

This architecture ensures:

- ✅ Reusability of components
- ✅ Clean separation of concerns
- ✅ Easy testing and maintenance
- ✅ Scalability for future features
