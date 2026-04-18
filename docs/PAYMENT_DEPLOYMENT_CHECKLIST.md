# Payment Flow — Deployment & Testing Checklist

## ✅ Backend Deployment

### Pre-Deploy Validation
- [ ] Build succeeds: `dotnet build src/Routin.sln` → 0 errors
- [ ] All endpoints tested locally:
  - [ ] `POST /api/subscriptions` → returns checkoutUrl + orderCode
  - [ ] `GET /api/payments/return?orderCode=...&status=PAID&code=00` → returns success
  - [ ] `POST /api/subscriptions/webhook/payos` → webhook signature verified
  - [ ] `GET /api/subscriptions/me` → shows Active status after payment

### Production Environment Variables (render.env)
```env
# PayOS Configuration
PAYOS_CLIENT_ID=<your-payos-client-id>
PAYOS_API_KEY=<your-payos-api-key>
PAYOS_CHECKSUM_KEY=<your-payos-checksum-key>

# Payment URLs (important for redirect)
PAYOS_RETURN_URL=https://routin.onrender.com/api/payments/return
PAYOS_CANCEL_URL=https://routin.onrender.com/cancel-payment

# Database (existing)
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

### Code Changes Applied
- [x] PayOsService: Added `GetPaymentInfoAsync()` method
- [x] PaymentService: Added `VerifyAndUpdatePayOsReturnAsync()` method + amount validation in webhook
- [x] PaymentsController: Added `POST /callback/payos` + `GET /return` endpoints
- [x] DTOs: Added `PayOsReturnQueryDto`, `PayOsPaymentInfoData`, `PayOsPaymentInfoResponse`
- [x] All code compiles with 0 errors

---

## 🔧 PayOS Dashboard Configuration

### 1. Update Webhook URL
**Go to:** PayOS Admin → Settings → Webhooks

**Current webhook URL:** `https://routin.onrender.com/api/subscriptions/webhook/payos`

**Options:**
- ✅ Keep existing (backward compatible - still works)
- ✅ Update to new: `https://routin.onrender.com/api/payments/callback/payos` (alias, same logic)

> Choose one and test thoroughly before going live.

### 2. Set Return URL
**Go to:** PayOS Admin → Settings → URLs

**Return URL (Success):**
```
https://routin.onrender.com/api/payments/return
```

**Cancel URL (Failure):**
```
https://routin.onrender.com/api/payments/cancel
```

> Important: Return URL must match `PAYOS_RETURN_URL` in backend config.

### 3. Test Webhook Delivery
**PayOS Dashboard → Logs/Events:**
- [ ] Confirm webhook events being sent after test payment
- [ ] Check HTTP status 200 returned
- [ ] Verify timestamp and signature

---

## 🧪 Local Testing Before Deploy

### Test Setup
```bash
# 1. Start backend locally
cd src
dotnet run

# 2. Check PayOS keys in appsettings.Development.json
# Should have sandbox/test PAYOS credentials

# 3. Open frontend at http://localhost:3000
```

### Test Scenarios

#### Scenario 1: Successful Payment via Return Flow
```
1. GET /api/subscription-plans
   ✓ See list of plans

2. POST /api/subscriptions { planId: "..." }
   ✓ Get checkoutUrl + orderCode

3. Open PayOS Sandbox → use test card
   Test Card: 4111111111111111
   exp: 12/25, CVC: 123
   ✓ Payment completed

4. PayOS redirects to /api/payments/return?orderCode=...&status=PAID&code=00
   ✓ Backend verifies with PayOS API
   ✓ Transaction.Status → Success
   ✓ UserSubscription.Status → Active
   ✓ User.IsPremium = true
   ✓ Return response: { success: true, data: {...} }

5. GET /api/subscriptions/me
   ✓ Shows status: "Active"

6. FE shows success modal → redirects to premium features page
   ✓ Premium features enabled
```

#### Scenario 2: Successful Payment via Webhook
```
1-3. Same as above

4. PayOS sends webhook to /api/subscriptions/webhook/payos
   ✓ Backend verifies HMAC signature
   ✓ Validates amount matches DB transaction
   ✓ Transaction.Status → Success
   ✓ UserSubscription.Status → Active

5. GET /api/subscriptions/me
   ✓ Shows status: "Active"
```

#### Scenario 3: Payment Cancelled
```
1-2. Same as above

3. User clicks "Cancel" on PayOS page
   PayOS redirects to /api/payments/return?cancel=true&orderCode=...

4. FE sees cancel flag
   ✓ Shows message "Payment cancelled"
   ✓ Returns to plans page
   ✓ Does NOT activate subscription

5. GET /api/subscriptions/me
   ✓ Shows status: "Pending" or "Cancelled"
```

#### Scenario 4: Amount Mismatch (Fraud Detection)
```
1-2. Create checkout for Plan ($9)
   Transaction.Amount = 9

3. Webhook arrives with amount: 19 (user/attacker tampered)
   ✓ Backend rejects: amount_mismatch
   ✓ Transaction stays Pending
   ✓ UserSubscription stays Pending

4. GET /api/subscriptions/me
   ✓ Shows status: "Pending"
   ✓ Premium features still locked
```

---

## 📊 Monitoring After Deploy

### Check Transaction Status
```bash
# SSH into production
ssh user@render.onrender.com

# Check recent transactions
psql $DATABASE_URL -c "
  SELECT 
    t.Id, t.OrderCode, t.Status, t.Amount, 
    us.Status as SubscriptionStatus,
    t.CreatedAt
  FROM Transactions t
  LEFT JOIN UserSubscriptions us ON t.UserSubscriptionId = us.Id
  ORDER BY t.CreatedAt DESC
  LIMIT 20;
"
```

### Check Logs for Errors
```bash
# PayOS verification failures
grep -i "AMOUNT_MISMATCH\|PAYMENT_NOT_VERIFIED" /var/log/routin/*.log

# Webhook signature failures
grep -i "signature\|verify webhook" /var/log/routin/*.log

# Transaction update failures
grep -i "transaction.*update.*fail" /var/log/routin/*.log
```

### Health Checks
- [ ] `/api/subscription-plans` returns 200
- [ ] `/api/subscriptions` (with auth) accepts POST
- [ ] `/api/subscriptions/me` (with auth) returns current subscription
- [ ] `/api/payments/me` (with auth) returns transaction history
- [ ] Admin: `/api/payments` (admin auth) lists all transactions

---

## 🚨 Troubleshooting

### Issue: Payment succeeds but Transaction stays Pending

**Possible causes:**
1. Webhook endpoint not configured in PayOS Dashboard
2. HMAC signature verification failed
3. Amount in webhook doesn't match transaction
4. PayOS GetPaymentInfoAsync API call failed

**Debug:**
```bash
# Check webhook logs
grep "webhook" /var/log/routin/*.log | head -20

# Check if signature check is entering webhook handler
grep "ProcessPayOsWebhookAsync" /var/log/routin/*.log

# Test webhook manually (if you have test payload)
curl -X POST http://localhost:5000/api/subscriptions/webhook/payos \
  -H "Content-Type: application/json" \
  -d '{"success":true,"code":"00",...}'

# Check database directly
psql $DATABASE_URL -c "
  SELECT * FROM Transactions 
  WHERE CreatedAt > now() - interval '1 hour'
  ORDER BY CreatedAt DESC;
"
```

### Issue: Return flow returns 404 "Transaction not found"

**Possible causes:**
1. orderCode in URL doesn't match any Transaction
2. Transaction was deleted/lost
3. orderCode parameter missing or malformed

**Debug:**
```bash
# Check if orderCode exists in DB
psql $DATABASE_URL -c "
  SELECT * FROM Transactions 
  WHERE OrderCode = 12345;
"

# Check if checkout endpoint was called
grep "CreateSubscriptionCheckoutAsync" /var/log/routin/*.log
```

### Issue: FE never sees success (return flow fails, webhook doesn't arrive)

**Possible causes:**
1. Both return path and webhook path failed independently
2. PayOS API not reachable from backend
3. Network timeout between PayOS and your backend

**Debug:**
```bash
# Test PayOS API connectivity
curl -X GET "https://api.payos.vn/v2/payment-requests/12345" \
  -H "x-client-id: $PAYOS_CLIENT_ID" \
  -H "x-api-key: $PAYOS_API_KEY"

# Check if GetPaymentInfoAsync is being called
grep "GetPaymentInfoAsync\|PayOS API" /var/log/routin/*.log

# Check timeout settings
grep -i "timeout\|http.*config" src/Routin.Infrastructure/Settings/PayOsSettings.cs
```

### Issue: User sees "Payment cancelled" but subscription is already Active

**Possible causes:**
1. Return flow succeeded before user saw cancel message
2. Webhook arrived after cancel
3. Race condition in concurrent processing

**This is actually OK** - subscription is active, user got the service. Just ensure:
- Database state is correct (subscription is Active)
- User can access premium features
- No double-charge occurs

---

## 📋 Final Checklist Before Going Live

### Backend
- [ ] All code committed and deployed to production
- [ ] `appsettings.Production.json` has PAYOS production keys (not sandbox)
- [ ] `render.env` has correct environment variables
- [ ] Run: `dotnet build --configuration Release` → 0 errors
- [ ] Database migrations applied to production
- [ ] Logs configured to capture payment errors
- [ ] Backup database before deploy

### PayOS Configuration
- [ ] Production API keys set (not sandbox)
- [ ] Webhook URL verified and tested
- [ ] Return URL verified (matches backend config)
- [ ] Cancel URL configured
- [ ] Webhook signature key matches backend PAYOS_CHECKSUM_KEY

### FE Configuration
- [ ] API base URL points to production: `https://routin.onrender.com`
- [ ] Payment page handles return URL properly
- [ ] Success/error modals display correct messages
- [ ] User state updates on token refresh
- [ ] Premium features enabled after subscription

### Testing (Production-like)
- [ ] Test with real PayOS account (but sandbox mode)
- [ ] Complete payment flow end-to-end
- [ ] Verify transaction in admin dashboard
- [ ] Verify user sees Premium badge
- [ ] Test error scenarios:
  - [ ] Cancel payment
  - [ ] Network timeout (simulate with browser dev tools)
  - [ ] Webhook delayed (wait 5 min and check if activated)

### Monitoring Setup
- [ ] Error logging configured
- [ ] Database monitoring setup
- [ ] Payment metrics dashboard created
- [ ] On-call alert for payment failures

### Communication
- [ ] Notify users about payment feature launch
- [ ] Provide support channels for payment issues
- [ ] Create payment FAQ / troubleshooting guide
- [ ] Brief customer support team on flow

---

## Quick Reference

**Payment State Transitions:**

```
Transaction: Pending → Success (via return) or Success (via webhook)
            |
            └→ Failed (user cancelled or payment rejected)

UserSubscription: Pending → Active (when Transaction → Success)
                 |
                 └→ Cancelled (when user cancels or payment fails)

User: IsPremium: false → true (when subscription → Active)
```

**Key API Payloads:**

```javascript
// Create checkout
POST /api/subscriptions
{ "planId": "uuid" }
→ { checkoutUrl, orderCode, transactionId, amount }

// Verify return
GET /api/payments/return?orderCode=123&status=PAID&code=00
→ { success: true, data: { transactionId, status, amount } }

// Check subscription status
GET /api/subscriptions/me
→ { data: { id, status: "Active", planId, activatedAt } }
```

---

## Success Criteria

✅ After deployment, you should see:
1. Users can subscribe to premium plans
2. PayOS checkout opens correctly
3. After payment, Transaction.Status = "Success" within 5 seconds
4. UserSubscription.Status = "Active" within 5 seconds  
5. User.IsPremium = true
6. Premium features become visible/usable
7. admin can see all transactions in `/api/payments`
8. Payment history visible in user's `/api/payments/me`

**If any of the above is missing, check logs first, then refer to Troubleshooting section above.**

---

**Questions? Check:**
- Backend logs: `/var/log/routin/`
- Database: `SELECT * FROM Transactions ORDER BY CreatedAt DESC`
- PayOS webhook logs: PayOS Dashboard → Logs
- FE console: Browser DevTools → Network tab during checkout
