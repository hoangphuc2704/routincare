# FE Payment Flow Integration Guide

## Overview

Payment flow sử dụng **dual-path verification** - cả return-flow (sync) và webhook (async) đều có thể activate subscription. Điều này đảm bảo reliability ngay cả khi network không ổn định.

**Quan trọng:** `ReturnUrl`/`CancelUrl` của PayOS phải trỏ về route FE, không trỏ thẳng API backend.

- Dev: `http://localhost:5173/payment/success`, `http://localhost:5173/payment/cancel`
- Prod: `https://<fe-domain>/payment/success`, `https://<fe-domain>/payment/cancel`

FE success route sẽ đọc query params rồi gọi API verify `GET /api/payments/return`.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────┐
│ 1. FE: GET /subscription-plans                  │
│    → User chọn gói ($9/tháng, $79/năm, ...)     │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│ 2. FE: POST /subscriptions { planId }           │
│    ← Backend trả: { checkoutUrl, orderCode }    │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│ 3. FE: Redirect → PayOS Checkout Page           │
│    window.location.href = checkoutUrl           │
│    User điền card → thanh toán                   │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
     ✅ SUCCESS              ❌ CANCEL/FAIL
          │                         │
┌─────────▼──────────────────┐    │
│ 4a. PayOS redirect FE to:  │    │
│ /payments/return?          │    │
│  orderCode=12345&          │    │
│  status=PAID&code=00       │    │
│                            │    │
│ FE: GET /payments/return   │    │ 4b. CANCEL/FAIL:
│     (Backend verifies)     │    │ /payments/return?
│     ← { success: true,     │    │  cancel=true
│        data: {...} }       │    │
│                            │    │
│ → FE shows "Success!"      │    │
│ → Redirect to Premium page │    │
│ → Store IsPremium = true   │    │
└────────────────────────────┘    │
                                 │
                    ┌────────────▼───────────┐
                    │ 5. FE shows error:     │
                    │ "Payment failed"       │
                    │ Offer retry option     │
                    └───────────────────────┘
```

---

## Step-by-Step Integration

### Step 1: Show Available Plans

**Request:**
```javascript
GET /api/subscription-plans
Authorization: Bearer <token>  // Can be anonymous for viewing plans
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Monthly",
      "price": 9,
      "currency": "VND",
      "billingPeriod": 1,
      "features": ["Reels upload", "AI suggestions", "Analytics"]
    },
    {
      "id": "uuid-2",
      "name": "Yearly",
      "price": 79,
      "currency": "VND",
      "billingPeriod": 12,
      "features": ["All monthly features", "20% savings"]
    }
  ]
}
```

**FE Code:**
```javascript
async function getPlans() {
  const response = await fetch('/api/subscription-plans');
  const { data: plans } = await response.json();
  
  // Render plan cards with "Subscribe" button for each
  plans.forEach(plan => {
    renderPlanCard(plan);
  });
}
```

---

### Step 2: Create Checkout (Get Payment Link)

**When user clicks "Subscribe" button:**

```javascript
async function checkout(planId) {
  const response = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ planId })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // ✅ Got checkout URL
    const { checkoutUrl, orderCode } = result.data;
    
    // Save orderCode in case needed for debugging
    localStorage.setItem('pendingOrderCode', orderCode);
    
    // Redirect to PayOS payment page
    window.location.href = checkoutUrl;
  } else {
    // ❌ Show error
    alert(`Error: ${result.error.message}`);
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://pay.payos.vn/web/...",
    "orderCode": 123456789,
    "transactionId": "uuid-xxx",
    "amount": 9,
    "currency": "VND"
  }
}
```

---

### Step 3: User Completes Payment on PayOS

User fills in payment details on PayOS page. No FE code needed here - just wait for redirect.

---

### Step 4a: Handle Return URL (Sync - Immediate Feedback)

After payment, PayOS redirects back to FE route:
```
https://your-fe-domain.com/payment/success?orderCode=123456789&status=PAID&code=00
```

**FE must capture these query params and verify:**

```javascript
// On page load, check for return flow
function handlePaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  
  const orderCode = params.get('orderCode');
  const status = params.get('status');
  const code = params.get('code');
  const cancel = params.get('cancel');
  
  if (!orderCode) return; // Not a return from PayOS
  
  // Call backend to verify and activate subscription
  verifyPaymentReturn(orderCode, status, code, cancel);
}

async function verifyPaymentReturn(orderCode, status, code, cancel) {
  try {
    const response = await fetch(
      `/api/payments/return?orderCode=${orderCode}&status=${status}&code=${code}${cancel ? '&cancel=true' : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      // ✅ Subscription activated!
      console.log('✅ Payment successful! Subscription is now active.');
      
      // Update local user state
      setUser({ ...user, IsPremium: true });
      
      // Clear pending orderCode
      localStorage.removeItem('pendingOrderCode');
      
      // Show success message
      showSuccessModal('Congratulations! You are now Premium.');
      
      // Redirect to premium features after 2 seconds
      setTimeout(() => {
        window.location.href = '/premium-features';
      }, 2000);
    } else {
      // ❌ Verification failed (amount mismatch, payment not PAID yet, etc.)
      console.error('Payment verification failed:', result.error);
      showErrorModal(result.error.message);
      
      // Offer retry: user can manually check status later
      // or contact support
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    showErrorModal('Network error while verifying payment. Please try again.');
  }
}

// Call on component mount
useEffect(() => {
  handlePaymentReturn();
}, []);
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid-xxx",
    "status": "Success",
    "amount": 9,
    "planName": "Monthly Premium"
  },
  "message": "Payment verified and subscription activated."
}
```

**Error Response (e.g., amount mismatch):**
```json
{
  "success": false,
  "error": {
    "code": "AMOUNT_MISMATCH",
    "message": "Transaction amount does not match PayOS payment amount."
  }
}
```

---

### Step 4b: Handle Server Webhook (Async - Backup Path)

FE doesn't need to do anything here - webhook happens server-to-server.

**But:** If return flow fails but webhook succeeds later, subscription still gets activated. So FE should:

1. After 10-15 seconds if return-flow errors out, check `/api/subscriptions/me` to see if subscription became Active
2. If it did, show success message anyway

```javascript
async function pollSubscriptionStatus(maxRetries = 3) {
  let retries = 0;
  
  const checkStatus = async () => {
    const response = await fetch('/api/subscriptions/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const { data: subscription } = await response.json();
    
    if (subscription?.status === 'Active') {
      // ✅ Webhook activated it!
      showSuccessModal('Payment successful via alternate path.');
      setUser({ ...user, IsPremium: true });
      return true;
    }
    
    retries++;
    if (retries < maxRetries) {
      // Wait 5 seconds, try again
      setTimeout(checkStatus, 5000);
    }
  };
  
  checkStatus();
}
```

---

## Error Handling

### Possible Errors from `/api/payments/return`:

| Error Code             | HTTP | Meaning                                      | FE Action                      |
|------------------------|------|----------------------------------------------|--------------------------------|
| `AMOUNT_MISMATCH`      | 400  | Amount doesn't match transaction in DB       | "Contact support - amount issue" |
| `PAYMENT_NOT_VERIFIED` | 400  | PayOS says payment not PAID yet               | "Wait a moment, payment pending" |
| `TRANSACTION_NOT_FOUND`| 404  | Order code invalid/expired                   | "Invalid order. Start over."     |
| `PAYMENT_CANCELLED`    | 400  | User clicked cancel in PayOS                 | "Payment cancelled. Try again." |

### Handling Cancellation:

If user clicks "Cancel" in PayOS, they are redirected to:
```
/payment/cancel?orderCode=...&cancel=true
```

**FE Code:**
```javascript
if (cancel === 'true') {
  showMessage('Payment cancelled. You can try again anytime.');
  redirectToPlans();
}
```

---

## Testing Guide

### Local Testing Flow

1. **Get plans:**
   ```bash
   curl http://localhost:5000/api/subscription-plans
   ```

2. **Create checkout:**
   ```bash
   curl -X POST http://localhost:5000/api/subscriptions \
     -H "Authorization: Bearer <YOUR_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"planId": "UUID_OF_PLAN"}'
   ```
   Response will have `checkoutUrl` - open in PayOS sandbox

3. **PayOS Sandbox** → https://sandbox.payos.vn
   - Accept payment with test card

4. **Simulate Return:**
   ```bash
   curl "http://localhost:5000/api/payments/return?orderCode=123456789&status=PAID&code=00" \
     -H "Authorization: Bearer <YOUR_TOKEN>"
   ```

5. **Verify subscription:**
   ```bash
   curl http://localhost:5000/api/subscriptions/me \
     -H "Authorization: Bearer <YOUR_TOKEN>"
   ```
   Should show `"status": "Active"`

---

## Environment Variables (FE Side)

Store these in `.env`:

```env
REACT_APP_API_BASE_URL=https://api.routin.app/v1
REACT_APP_PAYOS_CHECKOUT_TIMEOUT=300000  # 5 min timeout
REACT_APP_WEBHOOK_POLL_INTERVAL=5000     # 5 sec polling
```

---

## Key Points to Remember

✅ **Always get fresh token before calling `/api/subscriptions`**
- Token might expire between plan selection and checkout

✅ **Save orderCode before redirecting to PayOS**
- In case you need it for debugging or manual verification

✅ **Handle both return and webhook paths**
- Return is immediate, webhook is backup
- Either one can succeed first

✅ **Set a timeout on payment verification**
- If return fails after 15 seconds, assume webhook will handle it
- Show "verifying..." message to user

✅ **Always update User.IsPremium in local state**
- After successful payment, set `IsPremium = true`
- This unlocks premium features immediately

✅ **Handle network errors gracefully**
- If return-flow fails with 500, offer "Try again" button
- User can also wait for webhook and refresh page later

---

## Sample React Component

```javascript
import { useState, useEffect } from 'react';

export function SubscriptionCheckout({ plans, user, setUser, accessToken }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Check if returning from PayOS
  useEffect(() => {
    handlePaymentReturn();
  }, []);

  async function handlePaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    const orderCode = params.get('orderCode');
    
    if (!orderCode) return;

    setVerifying(true);
    try {
      const status = params.get('status');
      const code = params.get('code');
      const cancel = params.get('cancel');

      const response = await fetch(
        `/api/payments/return?orderCode=${orderCode}&status=${status}&code=${code}${cancel ? '&cancel=true' : ''}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );

      const result = await response.json();

      if (result.success) {
        setUser({ ...user, IsPremium: true });
        alert('✅ Subscription activated! Welcome to Premium.');
        window.location.href = '/premium-features';
      } else if (cancel === 'true') {
        alert('Payment cancelled.');
      } else {
        setError(`Payment verification failed: ${result.error.message}`);
        pollSubscriptionStatus();
      }
    } catch (err) {
      setError('Network error during payment verification');
      pollSubscriptionStatus();
    } finally {
      setVerifying(false);
    }
  }

  async function pollSubscriptionStatus(retries = 0) {
    if (retries >= 3) return;

    setTimeout(async () => {
      try {
        const response = await fetch('/api/subscriptions/me', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const { data: subscription } = await response.json();

        if (subscription?.status === 'Active') {
          setUser({ ...user, IsPremium: true });
          alert('✅ Subscription activated!');
          window.location.href = '/premium-features';
        } else {
          pollSubscriptionStatus(retries + 1);
        }
      } catch (err) {
        pollSubscriptionStatus(retries + 1);
      }
    }, 5000);
  }

  async function checkout(planId) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ planId })
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('pendingOrderCode', result.data.orderCode);
        window.location.href = result.data.checkoutUrl;
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Failed to create checkout');
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return <div>⏳ Verifying payment...</div>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>❌ {error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Choose Your Plan</h2>
      {plans.map(plan => (
        <div key={plan.id} style={{ border: '1px solid #ccc', padding: '20px', margin: '10px' }}>
          <h3>{plan.name}</h3>
          <p>${plan.price}/month</p>
          <button
            onClick={() => checkout(plan.id)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Summary

| Step | Action | Who | Status |
|------|--------|-----|--------|
| 1 | Display plans | FE | GET /subscription-plans |
| 2 | Create checkout | FE POST + BE creates Transaction | POST /subscriptions |
| 3 | Redirect to PayOS | FE | Opens checkoutUrl |
| 4a | Verify return (sync) | BE verifies + DB update | GET /payments/return |
| 4b | Webhook callback (async) | BE verifies + DB update | POST /subscriptions/webhook/payos |
| 5 | Update user state | FE | Check /api/subscriptions/me |
| 6 | Show premium features | FE | Conditional render based on IsPremium |

**Xong! Payment flow hoàn chỉnh.**
