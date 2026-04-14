# Revenue Dashboard - Quick Reference & Cheatsheet

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies

```bash
npm install react-apexcharts apexcharts
```

### 2. Add Route

```jsx
import RevenueDashboard from './page/RevenueDashboard';

<Route path="/admin/revenue" element={<RevenueDashboard />} />;
```

### 3. Access Dashboard

Navigate to `/admin/revenue` in your browser

---

## 📦 Project Structure Reference

```
src/
├── api/paymentApi.jsx                      ← API calls
├── components/
│   ├── SkeletonLoader.jsx                 ← Loading states
│   └── dashboard/
│       ├── SummaryCardsGrid.jsx           ← Top metrics
│       ├── DateRangeFilter.jsx            ← Filter control
│       └── charts/
│           ├── RevenueLineChart.jsx       ← Area chart
│           ├── RevenueBarChart.jsx        ← Bar chart
│           └── TopPlansDonutChart.jsx     ← Donut chart
├── page/RevenueDashboard.jsx              ← Main page
└── utils/revenueChartUtils.js             ← Formatters
```

---

## 🎯 Key Components & Usage

### RevenueDashboard (Main Container)

```jsx
import RevenueDashboard from './page/RevenueDashboard';

<RevenueDashboard />; // No props required
```

### SummaryCardsGrid

```jsx
<SummaryCardsGrid
  data={{
    totalRevenue: 1000000,
    totalTransactions: 500,
    todayRevenue: 50000,
    monthlyRevenue: 200000,
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

---

## 🔧 Utility Functions

### Currency Formatting

```jsx
import { formatVND } from './utils/revenueChartUtils';

formatVND(1000000); // "1,000,000 ₫"
formatVND(1000000, false); // "1,000,000"
```

### Short Numbers

```jsx
import { formatShortNumber } from './utils/revenueChartUtils';

formatShortNumber(1500000); // "1.5M"
formatShortNumber(950); // "950"
```

### Date Range

```jsx
import { getDateRange } from './utils/revenueChartUtils';

getDateRange('30days'); // { from: "2026-02-12", to: "2026-03-14" }
getDateRange('7days'); // { from: "2026-03-07", to: "2026-03-14" }
getDateRange('1year'); // { from: "2025-03-14", to: "2026-03-14" }
```

### Parse Month

```jsx
import { parseMonth } from './utils/revenueChartUtils';

parseMonth('2026-01'); // "Jan 2026"
parseMonth('2026-12'); // "Dec 2026"
```

---

## 🎨 Color Reference

```jsx
import { getDarkThemeColors } from './utils/revenueChartUtils';

// Available colors:
getDarkThemeColors.primary; // Blue (#3b82f6)
getDarkThemeColors.secondary; // Green (#10b981)
getDarkThemeColors.accent; // Amber (#f59e0b)
getDarkThemeColors.danger; // Red (#ef4444)
getDarkThemeColors.warning; // Orange (#f97316)
getDarkThemeColors.success; // Green (#22c55e)
getDarkThemeColors.text; // Light gray (#f3f4f6)
getDarkThemeColors.textSecondary; // Gray (#d1d5db)
getDarkThemeColors.bg; // Dark (#111827)
getDarkThemeColors.bgCard; // Darker (#1f2937)
```

---

## 📡 API Endpoints

All endpoints accept optional query params: `?from=2026-01-01&to=2026-03-14`

| Endpoint                          | Method | Response                                                            |
| --------------------------------- | ------ | ------------------------------------------------------------------- |
| `/api/payments/revenue/summary`   | GET    | `{ totalRevenue, totalTransactions, todayRevenue, monthlyRevenue }` |
| `/api/payments/revenue/by-month`  | GET    | `[{ month, amount }]`                                               |
| `/api/payments/revenue/by-plan`   | GET    | `[{ planName, revenue }]`                                           |
| `/api/payments/revenue/top-plans` | GET    | `[{ planName, revenue }]`                                           |

---

## 💾 State Management Pattern

```jsx
// Main state
const [dateRange, setDateRange] = useState('30days');
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Data states
const [summaryData, setSummaryData] = useState(null);
const [revenueByMonth, setRevenueByMonth] = useState([]);
const [revenueByPlan, setRevenueByPlan] = useState([]);
const [topPlans, setTopPlans] = useState([]);

// Loading states (for individual components)
const [loadingStates, setLoadingStates] = useState({
  summary: true,
  monthly: true,
  byPlan: true,
  topPlans: true,
});
```

---

## ⚙️ Common Customizations

### Change Default Date Range

```jsx
// In RevenueDashboard.jsx
const [dateRange, setDateRange] = useState('7days'); // was '30days'
```

### Add More Date Range Options

```jsx
// In DateRangeFilter.jsx
const ranges = [
  { value: '7days', label: 'Last 7 Days', icon: '📅' },
  { value: '30days', label: 'Last 30 Days', icon: '📊' },
  { value: '90days', label: 'Last 90 Days', icon: '📈' }, // New
  { value: '1year', label: '1 Year', icon: '📅' },
];
```

### Change Chart Height

```jsx
<Chart ... height={400} />  // Increase from 350 to 400
```

### Modify Colors

```jsx
// In RevenueLineChart.jsx
colors: ['#8b5cf6'],  // Purple instead of blue
```

---

## 🐛 Debug Checklist

| Issue                   | Solution                                                                         |
| ----------------------- | -------------------------------------------------------------------------------- |
| Charts not showing      | Check: 1) ApexCharts installed 2) Data passed 3) Browser console errors          |
| API 404 errors          | Check: Backend endpoints exist 2) Base URL correct 3) All HTTP params sent       |
| Loading never stops     | Check: 1) API returns data 2) No infinite loops 3) Error handling                |
| Styling looks wrong     | Check: 1) TailwindCSS configured 2) Dark mode enabled 3) Color classes exist     |
| Date filter not working | Check: 1) `getDateRange()` function works 2) API receives params 3) Data updates |

---

## 📱 Responsive Breakpoints

Dashboard automatically adjusts for:

- **Mobile** (< 640px): Single column, smaller fonts
- **Tablet** (640px - 1024px): 2 columns, medium fonts
- **Desktop** (> 1024px): 4 columns, full size

---

## 🔒 Security Notes

1. **API Authentication**

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

2. **Error Messages**: Don't expose sensitive data

```jsx
// ❌ Bad
throw new Error(`Failed to fetch from ${API_URL}`);

// ✅ Good
throw new Error('Failed to load revenue data');
```

3. **XSS Prevention**: Always sanitize user inputs

```jsx
// Be careful with dangerouslySetInnerHTML
// Use text content instead when possible
<div>{data.planName}</div>
```

---

## 📊 Test Data for Development

```jsx
// Fake data for testing without backend
const mockSummaryData = {
  totalRevenue: 5234000,
  totalTransactions: 1250,
  todayRevenue: 125000,
  monthlyRevenue: 450000,
  revenueTrend: 12,
  transactionTrend: 8,
};

const mockRevenueByMonth = [
  { month: '2026-01', amount: 100000 },
  { month: '2026-02', amount: 150000 },
  { month: '2026-03', amount: 125000 },
];

const mockRevenueByPlan = [
  { planName: 'Pro', revenue: 500000 },
  { planName: 'Basic', revenue: 300000 },
  { planName: 'Enterprise', revenue: 700000 },
];

const mockTopPlans = [
  { planName: 'Enterprise', revenue: 700000 },
  { planName: 'Pro', revenue: 500000 },
];
```

---

## 🚀 Performance Optimization Tips

### Memoize Components

```jsx
export default React.memo(RevenueLineChart);
```

### Lazy Load Charts

```jsx
const RevenueLineChart = React.lazy(() => import('./RevenueLineChart'));
```

### Cache API Calls

```jsx
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const getCachedData = async (key, fetcher) => {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

---

## 📚 Related Documentation Files

- [REVENUE_DASHBOARD_SETUP.md](REVENUE_DASHBOARD_SETUP.md) - Full setup guide
- [ADMIN_INTEGRATION_GUIDE.md](ADMIN_INTEGRATION_GUIDE.md) - Integration with existing admin
- This file - Quick reference

---

## 💡 Pro Tips

1. **Use Redux/Context** for complex state management
2. **Implement React Query** for better data fetching
3. **Add Filters**: Filter by plan type, status, etc.
4. **Export Reports**: Add CSV/PDF export functionality
5. **Real-time Updates**: Use WebSockets for live data
6. **Notifications**: Toast alerts for important events
7. **Pagination**: Handle large datasets
8. **Search**: Add search for plan names/transactions

---

## 🎓 Learning Resources

- **React Hooks**: https://react.dev/reference/react
- **TailwindCSS**: https://tailwindcss.com/
- **ApexCharts**: https://apexcharts.com/docs/
- **Axios**: https://axios-http.com/docs/intro
- **ES6+**: https://developer.mozilla.org/en-US/docs/Web/JavaScript

---

## 📞 Quick Help Commands

```bash
# Check installed packages
npm list react-apexcharts apexcharts axios

# Update packages
npm update react-apexcharts apexcharts

# Clear cache
npm cache clean --force

# Check for conflicts
npm audit

# Install peer dependencies
npm install --save-peer react-apexcharts
```

---

## ✅ Pre-Launch Checklist

- [ ] All components imported correctly
- [ ] API endpoints returning correct data
- [ ] Dark theme colors applied
- [ ] Loading states working
- [ ] Error handling implemented
- [ ] Responsive design tested
- [ ] No console errors
- [ ] Performance optimized
- [ ] Navigation links working
- [ ] Mobile tested
- [ ] Documentation updated
- [ ] Ready for production!

---

## 🎯 Next Steps

1. **Basic Setup** → Follow Quick Start (3 steps)
2. **Integration** → Read ADMIN_INTEGRATION_GUIDE.md
3. **Customization** → Use Quick Reference section
4. **Testing** → See Test Data for Development
5. **Deployment** → Complete Pre-Launch Checklist

Happy coding! 🚀
