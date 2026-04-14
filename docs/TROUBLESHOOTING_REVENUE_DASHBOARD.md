# Revenue Dashboard - Troubleshooting Guide

## 🐛 Common Issues & Fixes

### Issue 1: `data.map is not a function` Error

**Symptoms:**

```
RevenueLineChart.jsx:24 Uncaught TypeError: data.map is not a function
```

**Cause:** The data being passed to chart components is not an array.

**Solution - Step 1: Test with Mock Data**

In `src/page/RevenueDashboard.jsx`, change this line:

```jsx
const USE_MOCK_DATA = false; // ← Change to TRUE
```

To:

```jsx
const USE_MOCK_DATA = true; // ✅ Test with mock data
```

Then refresh your browser. If charts work with mock data, the API response format is the issue.

---

### Issue 2: API Response Format Mismatch

**Debug the API Response:**

1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for API calls like:
   - `/api/payments/revenue/summary`
   - `/api/payments/revenue/by-month`
   - etc.

4. Click on each request and check the Response tab

**Expected Response Format:**

```json
// For summary endpoint
{
  "data": {
    "totalRevenue": 1000000,
    "totalTransactions": 500,
    "todayRevenue": 50000,
    "monthlyRevenue": 200000
  }
}

// For monthly revenue endpoint
{
  "data": [
    { "month": "2026-01", "amount": 100000 },
    { "month": "2026-02", "amount": 150000 }
  ]
}

// For plan revenue endpoint
{
  "data": [
    { "planName": "Pro", "revenue": 500000 },
    { "planName": "Basic", "revenue": 300000 }
  ]
}
```

**If Response Format is Different:**

Edit `src/page/RevenueDashboard.jsx` and adjust the data parsing in `fetchDashboardData`:

```jsx
// Example: If API returns data directly without wrapping
// Before:
const monthlyData = Array.isArray(monthlyRes?.data) ? monthlyRes.data : [];

// After:
const monthlyData = Array.isArray(monthlyRes)
  ? monthlyRes
  : Array.isArray(monthlyRes?.data)
    ? monthlyRes.data
    : [];
```

---

### Issue 3: Check Console Errors

**Enable Debug Logging:**

The code now includes console logging. Check the browser console for:

```
API Responses: { ... }  // Shows actual API responses
Processed Data: { ... }  // Shows processed data
```

This helps identify exactly where data is being lost or misformatted.

---

## 🧪 Testing Workflow

### Step 1: Verify Mock Data Works

```
USE_MOCK_DATA = true
↓
Refresh page
↓
Do charts display? → YES ✅ Problem is with API data
                 → NO  ❌ Problem is with components
```

### Step 2: If Mock Data Works

- Backend endpoint is returning wrong format
- Compare expected vs actual API response
- Adjust parsing in `fetchDashboardData`

### Step 3: If Mock Data Fails

- Component issue (unlikely after fixes)
- Check browser console for JavaScript errors
- Verify all imports are correct

---

## 🔧 Quick Fixes

### Fix 1: Verify API Endpoints Exist

Your backend needs these endpoints:

```
GET /api/payments/revenue/summary
GET /api/payments/revenue/by-month?from=DATE&to=DATE
GET /api/payments/revenue/by-plan?from=DATE&to=DATE
GET /api/payments/revenue/top-plans?from=DATE&to=DATE
```

If any endpoint is missing, the dashboard will error out.

### Fix 2: CORS Issues

If API calls fail with CORS error, ensure backend has:

```
Access-Control-Allow-Origin: *  (or your frontend URL)
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### Fix 3: Authentication

Ensure authentication token is being sent:

```
Check that axiosClient includes:
Authorization: Bearer YOUR_TOKEN
```

---

## 📊 Testing with Mock Data Permanently

If backend is not ready, you can keep using mock data:

**Option A: Keep USE_MOCK_DATA = true**

```jsx
const USE_MOCK_DATA = true; // Always use mock data
```

**Option B: Use Query Parameter**

```jsx
const USE_MOCK_DATA = new URLSearchParams(window.location.search).get('mock') === 'true';
// Access at: /admin/revenue?mock=true
```

**Option C: Environment Variable**

```jsx
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';
// Set in .env: REACT_APP_USE_MOCK_DATA=true
```

---

## 🔍 Detailed Debugging

### Check Data Type

Add this to RevenueDashboard after setting data:

```jsx
console.log('Type of revenueByMonth:', Array.isArray(revenueByMonth));
console.log('revenueByMonth content:', revenueByMonth);
```

### Check Component Props

In each chart component, add:

```jsx
useEffect(() => {
  console.log('Chart received data:', data);
  console.log('Is array?', Array.isArray(data));
}, [data]);
```

### Validate Array Operations

Before `.map()`, ensure:

```jsx
if (!Array.isArray(data)) {
  console.error('Data is not an array:', data);
  return null;
}
```

---

## 🎯 Common Backend Response Issues

### Issue: Data nested in object

```json
{
  "data": {
    "monthly": [...]  // ← Instead of direct array
  }
}
```

**Fix:** `monthlyData = response?.data?.monthly`

### Issue: Data wrapped in success object

```json
{
  "success": true,
  "message": "OK",
  "data": [...]
}
```

**Fix:** Already handled ✅

### Issue: Direct array response (no wrapping)

```json
[{ "month": "2026-01", "amount": 100000 }]
```

**Fix:** Check for this in RevenueDashboard parsing

---

## ✅ Verification Checklist

- [ ] Mock data works (USE_MOCK_DATA = true)?
- [ ] API endpoints existing on backend?
- [ ] API responses have correct format?
- [ ] Authentication token being sent?
- [ ] No JavaScript errors in console?
- [ ] Charts rendering with mock data?
- [ ] Date range filter working?
- [ ] Loading states appearing?

---

## 📞 Final Troubleshooting

If still having issues:

1. **Enable mock data:**

   ```jsx
   const USE_MOCK_DATA = true;
   ```

2. **Check browser console** (F12 → Console tab)

3. **Verify all files updated:**
   - RevenueDashboard.jsx
   - RevenueLineChart.jsx
   - RevenueBarChart.jsx
   - TopPlansDonutChart.jsx

4. **Clear cache:**

   ```
   Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   ```

5. **Check network tab** (F12 → Network tab) for failed requests

---

## 🚀 Next Steps

Once mock data works:

1. Check actual API response format
2. Adjust data parsing as needed
3. Test with real API
4. Turn off mock data: `USE_MOCK_DATA = false`

---

If problems persist, the mock data will let you see if the dashboard UI works correctly while you debug the API integration!
