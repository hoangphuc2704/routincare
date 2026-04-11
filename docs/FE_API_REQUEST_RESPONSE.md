# FE API Request/Response Contract

Tai lieu nay tong hop request va response mau cho cac API da implement de FE tich hop nhanh.

## 1. Base conventions

- Base URL: `/api`
- Auth header cho endpoint can dang nhap:

```http
Authorization: Bearer <access_token>
```

- Success envelope:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

- Error envelope:

```json
{
  "success": false,
  "message": "error message"
}
```

## 2. Auth APIs (`/api/auth`)

### POST `/api/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt...",
    "refreshToken": "refresh...",
    "expiresAt": "2026-03-16T10:00:00Z",
    "user": {
      "id": "guid",
      "fullName": "User Name",
      "email": "user@example.com",
      "avatarUrl": null,
      "bio": null,
      "authProvider": "Local",
      "isEmailVerified": true,
      "createdAt": "2026-03-10T10:00:00Z"
    },
    "roles": ["User"]
  },
  "message": ""
}
```

### POST `/api/auth/register`

Request:

```json
{
  "fullName": "User Name",
  "email": "user@example.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

Response `201`: cung format `TokenResponseDto` nhu login.

### POST `/api/auth/register/otp/send`

Request:

```json
{
  "email": "user@example.com"
}
```

### POST `/api/auth/register/otp/resend`

Request:

```json
{
  "email": "user@example.com"
}
```

Response `200`:

```json
{
  "success": true,
  "data": null,
  "message": "OTP sent successfully. Please check your email."
}
```

Response `200`:

```json
{
  "success": true,
  "data": null,
  "message": "OTP sent successfully."
}
```

### POST `/api/auth/register/otp/verify`

Request:

```json
{
  "email": "user@example.com",
  "code": "123456",
  "fullName": "User Name",
  "password": "123456"
}
```

Response `201`: cung format `TokenResponseDto`.

Response `400` (OTP handling):

```json
{
  "success": false,
  "message": "OTP is incorrect."
}
```

```json
{
  "success": false,
  "message": "OTP has expired. Please request a new OTP."
}
```

```json
{
  "success": false,
  "message": "OTP has already been used. Please request a new OTP."
}
```

```json
{
  "success": false,
  "message": "OTP not found. Please request a new OTP."
}
```

### POST `/api/auth/google`

Request:

```json
{
  "idToken": "google_id_token"
}
```

Response `200`: cung format `TokenResponseDto`.

### POST `/api/auth/refresh-token`

Request:

```json
{
  "refreshToken": "refresh..."
}
```

Response `200`: cung format `TokenResponseDto`.

### POST `/api/auth/logout`

Request:

```json
{
  "refreshToken": "refresh..."
}
```

Response `200`:

```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully."
}
```

## 3. Users APIs (`/api/users`)

### GET `/api/users/me`
Response `200`: `UserDto`.

### PATCH `/api/users/me`
Request:

```json
{
  "fullName": "New Name",
  "phoneNumber": "0900000000",
  "avatarUrl": "https://res.cloudinary.com/...",
  "bio": "new bio"
}
```

Response `200`: `UserDto` sau update.

### PATCH `/api/users/me/password`

Request:

```json
{
  "currentPassword": "old123456",
  "newPassword": "new123456"
}
```

Response `200`:

```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully."
}
```

### Admin

- GET `/api/users` (Admin)
- GET `/api/users/{id}` (Admin)
- POST `/api/users` (Admin)

Create request:

```json
{
  "fullName": "Created By Admin",
  "email": "newuser@example.com",
  "password": "123456"
}
```

## 4. Social APIs (`/api/users`)

### POST `/api/users/{id}/follow`
No body. Response `200`:

```json
{ "success": true, "data": null, "message": "" }
```

### DELETE `/api/users/{id}/follow`
No body. Response `204` (NoContent).

### GET `/api/users/{id}/followers`
### GET `/api/users/{id}/following`
Response `200` list `SocialUserDto`:

```json
{
  "success": true,
  "data": [
    {
      "userId": "guid",
      "fullName": "User A",
      "avatarUrl": null,
      "bio": null,
      "since": "2026-03-16T09:00:00Z"
    }
  ],
  "message": ""
}
```

### POST `/api/users/{id}/block`
No body. Response `200`.

### DELETE `/api/users/{id}/block`
No body. Response `204`.

### GET `/api/users/me/blocks`
Response `200`: list `SocialUserDto`.

## 5. Friends APIs (`/api/friends`)

### POST `/api/friends/requests/{userId}`
No body.

Response `201`:

```json
{
  "success": true,
  "data": {
    "requestId": "guid",
    "requesterId": "guid",
    "requesterName": "",
    "addresseeId": "guid",
    "addresseeName": "",
    "status": "Pending",
    "createdAt": "2026-03-16T09:00:00Z"
  },
  "message": "Created successfully."
}
```

### GET `/api/friends/requests/incoming`
### GET `/api/friends/requests/outgoing`
Response `200`: list `FriendRequestDto`.

### POST `/api/friends/requests/{id}/accept`
### POST `/api/friends/requests/{id}/reject`
No body. Response `200`.

### DELETE `/api/friends/requests/{id}`
No body. Response `200`.

### GET `/api/friends`
Response `200` list `FriendDto`:

```json
{
  "success": true,
  "data": [
    {
      "userId": "guid",
      "fullName": "Friend Name",
      "avatarUrl": null,
      "friendsSince": "2026-03-16T09:00:00Z"
    }
  ],
  "message": ""
}
```

### DELETE `/api/friends/{userId}`
No body. Response `204`.

## 6. Chat APIs (`/api/chats`)

### POST `/api/chats/direct/{userId}`
No body.

Response `200|201`:

```json
{
  "success": true,
  "data": {
    "conversationId": "guid",
    "type": "Direct",
    "title": null,
    "lastMessageAt": null
  },
  "message": ""
}
```

### GET `/api/chats/conversations`
Response `200`: list `ConversationDto`.

### GET `/api/chats/conversations/{id}/messages?before=<ISODate>&limit=50`
Response `200`: list `MessageDto`.

### POST `/api/chats/conversations/{id}/messages`
Request:

```json
{
  "type": "Text",
  "body": "hello",
  "clientMessageId": "optional-client-id"
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "messageId": "guid",
    "conversationId": "guid",
    "senderId": "guid",
    "type": "Text",
    "body": "hello",
    "clientMessageId": "optional-client-id",
    "createdAt": "2026-03-16T09:00:00Z"
  },
  "message": "Created successfully."
}
```

### PATCH `/api/chats/conversations/{id}/read`
Request:

```json
{
  "lastReadMessageId": "guid"
}
```

Response `200`.

### DELETE `/api/chats/messages/{id}`
No body. Response `204`.

## 7. Chat Realtime (SignalR)

Hub endpoint:

- `/hubs/chat?access_token=<jwt>`

Client methods:

- `JoinConversation(conversationId)`
- `LeaveConversation(conversationId)`

Server events:

- `chat:conversation-upsert`
- `chat:message-created`
- `chat:conversation-read`
- `chat:message-deleted`

## 8. Categories APIs (`/api/categories`)

### GET `/api/categories`
### GET `/api/categories/{id}`
Public. Response data: `CategoryDto` hoặc list.

### POST `/api/categories` (Admin)
Request:

```json
{
  "name": "Health",
  "description": "Health routines",
  "iconName": "heart",
  "colorHex": "#22C55E",
  "sortOrder": 1
}
```

Response `201`: `CategoryDto`.

### PUT/PATCH `/api/categories/{id}` (Admin)
Request: `UpdateCategoryDto`.

### DELETE `/api/categories/{id}` (Admin)
Response `204`.

## 9. Routines APIs (`/api/routines`)

### GET `/api/routines/me`
### GET `/api/routines/today`
### GET `/api/routines/{id}`

Response:
- `/me`: list `RoutineDto`
- `/today`: `TodayOverviewDto`
- `/{id}`: `RoutineDetailDto`

### POST `/api/routines`
Request (`CreateRoutineDto`):

```json
{
  "title": "Morning Routine",
  "description": "My morning routine",
  "themeColor": "#4F46E5",
  "categoryId": "guid",
  "repeatType": "Daily",
  "repeatDays": null,
  "remindTime": "07:00:00",
  "visibility": "Public"
}
```

### PUT `/api/routines/{id}`
Request (`UpdateRoutineDto`): partial fields.

### DELETE `/api/routines/{id}`
Response `204`.

### POST `/api/routines/{id}/copy`
Response `201|200`: `RoutineDto` cua ban sao.

### Task management

- POST `/api/routines/{routineId}/tasks`
- PUT `/api/routines/{routineId}/tasks/{taskId}`
- DELETE `/api/routines/{routineId}/tasks/{taskId}`
- PUT `/api/routines/{routineId}/tasks/reorder`

`CreateRoutineTaskDto` request sample:

```json
{
  "title": "Drink water",
  "unitType": "Ml",
  "targetValue": 2000,
  "unitName": "ml",
  "iconName": "droplet",
  "iconColor": "#3B82F6",
  "notes": "split in a day",
  "tips": "carry bottle",
  "estimatedMinutes": 0,
  "mediaUrl": null,
  "difficultyLevel": "Easy",
  "restAfterSeconds": null,
  "prepareItems": []
}
```

`ReorderTasksDto`:

```json
{
  "taskIds": ["guid1", "guid2", "guid3"]
}
```

### Prepare items

- POST `/api/routines/{routineId}/tasks/{taskId}/prepare-items`
- PUT `/api/routines/{routineId}/tasks/{taskId}/prepare-items/{itemId}`
- DELETE `/api/routines/{routineId}/tasks/{taskId}/prepare-items/{itemId}`
- POST `/api/routines/{routineId}/prepare-items`
- PUT `/api/routines/{routineId}/prepare-items/{itemId}`
- DELETE `/api/routines/{routineId}/prepare-items/{itemId}`

`CreatePrepareItemDto`:

```json
{
  "name": "Yoga mat",
  "description": "non-slip",
  "imageUrl": null,
  "purchaseUrl": null,
  "iconName": "package",
  "category": "Equipment",
  "isRequired": true,
  "orderIndex": 0
}
```

## 10. Task Logs APIs (`/api/tasklogs`)

### GET `/api/tasklogs/today`
Response: list `TaskLogDto`.

### POST `/api/tasklogs/checkin`
Request:

```json
{ "taskId": "guid" }
```

Response: `TaskLogDto`.

### POST `/api/tasklogs/log`
Request:

```json
{ "taskId": "guid", "value": 1500 }
```

Response: `TaskLogDto`.

### POST `/api/tasklogs/{id}/skip`
No body. Response: `TaskLogDto`.

### PATCH `/api/tasklogs/{id}/evidence`
Request:

```json
{ "evidenceUrl": "https://res.cloudinary.com/..." }
```

Response: `TaskLogDto`.

### DELETE `/api/tasklogs/{id}`
Response `204`.

## 11. Analytics APIs (`/api/analytics`)

- GET `/api/analytics/me/overview` -> `AnalyticsOverviewDto`
- GET `/api/analytics/me/streaks` -> `StreaksDto`
- GET `/api/analytics/me/heatmap?year=2026` -> `HeatmapItemDto[]`
- GET `/api/analytics/me/routines` -> `RoutinePerformanceDto[]`
- GET `/api/analytics/me/routines/{id}` -> `RoutineAnalyticsDetailDto`
- GET `/api/analytics/me/tasks` -> `TaskStatsDto[]`
- GET `/api/analytics/me/progress-chart` -> `ProgressChartPointDto[]`

Tat ca response dung success envelope.

## 12. Subscription APIs (`/api/subscription-plans`, `/api/subscriptions`, `/api/payments`)

### Subscription plans

- GET `/api/subscription-plans`
- GET `/api/subscription-plans/{id}`
- POST `/api/subscription-plans` (Admin)
- PATCH `/api/subscription-plans/{id}` (Admin)
- DELETE `/api/subscription-plans/{id}` (Admin)

Create plan request:

```json
{
  "name": "Premium Monthly",
  "description": "30 days premium",
  "price": 49000,
  "durationDays": 30,
  "isActive": true
}
```

Plan response (`SubscriptionPlanDto`):

```json
{
  "id": "guid",
  "name": "Premium Monthly",
  "description": "30 days premium",
  "price": 49000,
  "durationDays": 30
}
```

### Checkout subscription

- POST `/api/subscriptions`
- POST `/api/subscriptions/checkout/{planId}`

Request (body version):

```json
{ "planId": "guid" }
```

Response `200` (`CheckoutResponseDto`):

```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://pay.payos.vn/...",
    "qrCode": "0002010102...",
    "orderCode": 123456789
  },
  "message": ""
}
```

### User subscriptions

- GET `/api/subscriptions/me`
- POST `/api/subscriptions/{id}/cancel`
- GET `/api/subscriptions` (Admin)

Response data: `UserSubscriptionDto` hoặc list.

### PayOS webhook

- POST `/api/subscriptions/webhook/payos`

Request body (`PayOsWebhookType`) sample:

```json
{
  "code": "00",
  "desc": "success",
  "success": true,
  "data": {
    "orderCode": 123456789,
    "amount": 49000,
    "description": "Routin Premium",
    "accountNumber": "123456789",
    "reference": "ref",
    "transactionDateTime": "2026-03-16 10:00:00",
    "currency": "VND",
    "paymentLinkId": "plink_...",
    "code": "00",
    "desc": "success"
  },
  "signature": "..."
}
```

Webhook response:

```json
{ "success": true, "data": true, "message": "" }
```

### Payments

- GET `/api/payments/me`
- GET `/api/payments` (Admin)

Response data: list `PaymentHistoryDto`.

## 13. Media API (`/api/media`)

### POST `/api/media/sign-upload`
Request:

```json
{
  "folder": "routin/chat",
  "resourceType": "auto"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "cloudName": "your-cloud",
    "apiKey": "...",
    "timestamp": 1710000000,
    "signature": "sha1...",
    "folder": "routin/chat",
    "uploadUrl": "https://api.cloudinary.com/v1_1/your-cloud/auto/upload"
  },
  "message": ""
}
```

## 14. Admin alias APIs

Ngoai route goc ben tren, he thong co alias admin:

- `/api/admin/users` (GET, GET by id, POST)
- `/api/admin/categories` (POST, GET by id, PATCH, DELETE)

Contract request/response giong endpoint chinh tuong ung.
