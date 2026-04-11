# Learn2Code Payment + PayOS + Subscription Flow (Chi tiet)

## 1) Pham vi tai lieu
Tai lieu nay tong hop theo code hien tai trong backend:
- API layer: PaymentController, SubscriptionController
- Application layer: PaymentService, SubscriptionService, Mapper
- Infrastructure layer: PayOsService, UnitOfWork, Repositories, Options
- Domain layer: Payment, UserSubscription, SubscriptionPackage, enums

Muc tieu: mo ta kien truc he thong, cach implement PayOS, cach webhook hoat dong, va checklist de luong thanh toan thanh cong on dinh.

## 2) Tong quan kien truc he thong
He thong dung kien truc nhieu layer:
- Controller (API): nhan HTTP request, auth/authorize, map sang service.
- Application Service: chua business logic thanh toan + subscription.
- Infrastructure Service: goi PayOS API qua HttpClient, ky signature, verify signature.
- Repository/UnitOfWork: luu/truy van DB.
- Domain Entity: Payment, UserSubscription, SubscriptionPackage.

### 2.1 Thanh phan chinh
- SubscriptionController:
  - POST /api/subscriptions (tao dang ky + tao payment link)
  - POST /api/subscriptions/{id}/renew (gia han + tao payment link)
  - POST /api/subscriptions/{id}/cancel
  - GET /api/subscriptions/me
- PaymentController:
  - POST /api/payments/callback/payos (webhook callback public)
  - GET /api/payments/return (return URL tu PayOS)
  - GET /api/payments (admin)
  - GET /api/payments/me (student/admin)
- SubscriptionService:
  - Tao UserSubscription Pending + Payment Pending
  - Goi PayOS tao checkout URL
- PaymentService:
  - Xu ly webhook
  - Verify return flow
  - Cap nhat PaymentStatus va kich hoat subscription
- PayOsService:
  - CreatePaymentLinkAsync
  - GetPaymentInfoAsync
  - VerifyWebhookSignature

## 3) Data model lien quan

### 3.1 Payment
Truong quan trong:
- PaymentId (Guid)
- SubscriptionId (Guid)
- Amount (decimal)
- PaymentMethod = PayOS
- TransactionId (string): dung de luu orderCode cua PayOS
- Status: Pending | Success | Failed
- PaidAt, CreatedAt

### 3.2 UserSubscription
Truong quan trong:
- SubscriptionId, UserId, PackageId
- StartDate, EndDate
- Status: Pending | Active | Expired | Cancelled
- RenewedFromId (cho luong renew)

### 3.3 SubscriptionPackage
Truong quan trong:
- DurationMonths
- Price
- DiscountPercent
- IsActive

## 4) End-to-end flow: Tao subscription moi

### Buoc 1: Client goi POST /api/subscriptions
Input:
- package_id

Dieu kien:
- user da auth (Student/Admin)
- package ton tai va IsActive = true
- user chua co subscription Active

### Buoc 2: Service tao du lieu Pending
SubscriptionService tao:
- UserSubscription voi Status = Pending
- Payment voi Status = Pending
- Payment.TransactionId = orderCode (unix milliseconds dang string)

Amount tinh theo:
- effectivePrice = package.Price * (1 - package.DiscountPercent / 100)

### Buoc 3: Goi PayOS tao payment link
SubscriptionService tao request:
- orderCode (long)
- amount (int)
- description (cat toi da 25 ky tu)
- returnUrl
- cancelUrl
- webhookUrl = null (theo comment code: PayOS v2 khong nhan webhookUrl trong request)

PayOsService:
- Gan headers:
  - x-client-id
  - x-api-key
- Tao signature HMACSHA256 voi checksum key
- POST /v2/payment-requests
- Nhan checkoutUrl

### Buoc 4: Luu DB va tra response
Sau khi co checkoutUrl:
- Luu subscription pending + payment pending
- Tra CreateSubscriptionResponse cho FE, trong do co:
  - subscription_id
  - payment_id
  - payment_url (checkoutUrl)
  - amount
  - status

### Buoc 5: FE redirect user sang payment_url
User thanh toan tren PayOS.

## 5) End-to-end flow: Renew subscription
Tuong tu tao moi, khac o cho:
- Can subscription cu ton tai va khong Cancelled
- Package cua subscription cu phai con active
- StartDate moi = max(now, old.EndDate)
- Tao renewal subscription pending + payment pending + payOS link

## 6) Return URL flow (dong bo sau khi user quay lai)
Endpoint:
- GET /api/payments/return?orderCode=...&status=...&code=...&cancel=...

Xu ly trong PaymentService.VerifyAndUpdatePaymentAsync:
1. Tim payment theo TransactionId == orderCode
2. Neu cancel=true hoac status=CANCELLED:
   - Neu payment dang Pending -> chuyen Failed
   - Tra thong bao canceled
3. Neu payment da Success -> bo qua (idempotent mot phan)
4. Validate query: code phai "00" va status phai "PAID"
5. Goi PayOS API GET /v2/payment-requests/{orderCode} de verify lai
6. Verify amount trung khop
7. Verify PayOS status la PAID
8. Cap nhat payment -> Success, set PaidAt
9. Activate subscription (Status -> Active)

PaymentController sau do redirect:
- Success: http://localhost:5173/payment/success?orderCode=...
- Failure: http://localhost:5173/payment/failure?orderCode=...&status=...

## 7) Webhook flow (bat dong bo, quan trong nhat)
Endpoint:
- POST /api/payments/callback/payos
- AllowAnonymous (public endpoint)

Pipeline lien quan:
- Program.cs co EnableBuffering cho request body, cho phep doc raw body.

Xu ly trong PaymentController:
1. Doc raw body string
2. Log orderCode
3. Goi PaymentService.ProcessPayOsWebhookAsync(webhook, rawBody)

Xu ly trong PaymentService.ProcessPayOsWebhookAsync:
1. Validate webhook.Data != null
2. Neu co signature:
   - VerifyWebhookSignature(rawBody, signature)
3. Tim payment theo orderCode (TransactionId)
4. Verify amount webhook == payment.Amount
5. Xac dinh newStatus:
   - webhook.Code == "00" va webhook.Data.Code == "00" -> Success
   - nguoc lai -> Failed
6. Neu status cu = status moi -> skip (giam duplicate webhook)
7. Update payment status, set PaidAt neu Success
8. Neu Success -> ActivateSubscriptionAsync(subscriptionId)
9. Commit transaction

Response tra ve:
- success/message/new_status

## 8) Co che idempotency va tinh nhat quan
Da co:
- Skip neu payment da o cung status (webhook duplicate)
- Return flow bo qua neu payment da Success
- Verify amount de tranh tampering
- Verify lai voi PayOS API trong return flow

Chua manh (nen nang cap):
- Chua co unique constraint ro rang cho transaction_id (nen co)
- Chua co optimistic concurrency token (row version)
- Chua co distributed lock cho webhook race condition

## 9) Cau hinh bat buoc de luong thanh cong

## 9.1 PayOS config
He thong doc config tu:
- ENV uu tien:
  - PAYOS_CLIENT_ID
  - PAYOS_API_KEY
  - PAYOS_CHECKSUM_KEY
- Neu khong co ENV thi fallback appsettings PayOS section

Field can dung:
- ClientId
- ApiKey
- ChecksumKey
- BaseUrl (mac dinh https://api-merchant.payos.vn)
- ReturnUrl
- CancelUrl
- WebhookUrl (dang de trong trong appsettings hien tai)

## 9.2 URL callback
Can dam bao:
- ReturnUrl phai tro dung backend endpoint /api/payments/return
- Webhook endpoint /api/payments/callback/payos phai public internet
- FE success/failure routes ton tai va mapping dung

## 9.3 HTTPS
Can co HTTPS hop le cho callback production.

## 10) Checklist van hanh de thanh toan thanh cong

### Truoc khi go-live
1. Dat dung ENV PayOS credentials (khong hard-code).
2. Kiem tra ReturnUrl/CancelUrl/WebhookUrl trung domain production.
3. Expose webhook endpoint ra internet (reverse proxy + TLS).
4. Dam bao DB migration da co index/unique cho payments.transaction_id.
5. Bat logging co mask secret.

### Trong runtime
1. User tao subscription -> nhan payment_url.
2. User thanh toan tren PayOS.
3. Return flow cap nhat nhanh trang thai.
4. Webhook flow xac nhan bat dong bo (nguon su that cuoi cung).
5. Payment Success -> Subscription Active.

### Sau giao dich
1. Kiem tra payment status trong GET /api/payments/me.
2. Kiem tra subscription status trong GET /api/subscriptions/me.
3. Neu chua Active, doi webhook hoac retry verification theo orderCode.

## 11) Diem manh va diem yeu trong implementation hien tai

### Diem manh
- Da tach lop ro: Controller -> Service -> Infrastructure.
- Co verify amount ca webhook va return flow.
- Co verify lai PayOS API trong return flow.
- Co idempotent co ban khi xu ly duplicate.

### Diem yeu / rui ro can xu ly
1. Hardcoded secret trong appsettings.json (bao mat cao).
2. Verify webhook signature dang dung raw body nguyen khoi; neu PayOS ky tren canonical data khac raw body thi de false negative.
3. PaymentController return redirect dang hardcode FE localhost:5173.
4. CancelUrl trong config hien tai la /payment/cancel (khong thay endpoint backend tuong ung trong controller).
5. Description bi cat 25 ky tu, can dam bao dung rule PayOS va tracking de debug.
6. Trong PayOsService co log request JSON + checksum input, can dam bao khong lo key/secret khi production.

## 12) De xuat hardening de dat ti le thanh cong cao nhat
1. Chuyen toan bo PayOS credential sang ENV/secret manager, xoa khoi appsettings commit.
2. Bo sung unique index cho payments.transaction_id.
3. Chuan hoa signature verification theo dung doc PayOS (canonical string, thu tu field dung chuan).
4. Dung webhook la source of truth cuoi cung; return flow chi de UX nhanh.
5. Tao co che retry/background job doi voi payment Pending qua timeout.
6. Bo sung audit log theo orderCode, paymentId, subscriptionId.
7. Them monitoring + alert khi webhook fail rate tang.
8. Dung config FE redirect URL theo environment, khong hardcode localhost.

## 13) Test matrix khuyen nghi

### Case thanh cong
- Tao subscription moi, pay thanh cong, nhan ca return + webhook.
- Ket qua: Payment=Success, Subscription=Active.

### Case huy
- User cancel tren trang PayOS.
- Ket qua: Payment=Failed (hoac giu Pending roi timeout policy), Subscription khong Active.

### Case duplicate webhook
- Gui lai cung payload webhook nhieu lan.
- Ket qua: khong tao side effect lap lai.

### Case tampering amount
- Webhook amount khac amount DB.
- Ket qua: reject voi AMOUNT_MISMATCH.

### Case race condition
- Return va webhook den gan nhu cung luc.
- Ket qua: payment va subscription van nhat quan.

### Case PayOS API timeout
- verify return flow khong goi duoc PayOS.
- Ket qua: bao loi hop ly, cho webhook xu ly tiep.

## 14) Tiep can implement chuan (goi y)

### Buoc 1: Tao subscription/payment pending
- API POST /api/subscriptions
- Save pending records
- Tao checkout URL

### Buoc 2: User thanh toan
- FE redirect checkoutUrl

### Buoc 3: Return URL
- Backend verify nhanh + redirect FE

### Buoc 4: Webhook confirm
- Verify signature
- Verify amount
- Update payment
- Activate subscription

### Buoc 5: Reconciliation
- Job dinh ky quet payment pending qua han, doi chieu PayOS API

## 15) Tom tat ngan
De luong thanh toan thanh cong on dinh:
- Tao Pending records truoc khi redirect
- Verify lai voi PayOS (amount + status)
- Xu ly webhook idempotent
- Kich hoat subscription chi khi payment Success
- Cau hinh callback URL + secret dung moi truong
- Bo sung hardening (secret manager, unique index, monitoring, retry)

Neu can, co the tao them 1 tai lieu API-spec rieng cho Payment/Subscription endpoint theo format request-response de team FE test bang Postman nhanh hon.
