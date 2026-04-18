# Routin FE API Documentation

> Version: 1.0.0
> FE source of truth: src/services/api/*.jsx
> Last Updated: 2026-04-18

---

## Response Format

Frontend assumes all APIs return a shared envelope.

### Success Response (2xx)

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

### Error Response (4xx, 5xx)

```json
{
  "success": false,
  "message": "error message"
}
```

### Common HTTP Status Codes

| Code | Meaning |
| ---- | ------- |
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Base URL and Auth

- Base URL behavior is controlled by `src/services/core/axiosClient.jsx`.
- In local dev (`localhost:5173`), FE sends relative requests (through Vite proxy).
- In other environments, FE uses `VITE_API_BASE_URL`.
- Protected APIs use header:

```http
Authorization: Bearer <access_token>
```

- FE automatically refreshes token on `401` via:

```http
POST /api/Auth/refresh-token
```

---

## Auth API

### Register

```http
POST /api/Auth/register
Content-Type: application/json
```

Request body:

```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

### Register OTP

```http
POST /api/Auth/register/otp/send
POST /api/Auth/register/otp/verify
```

### Login

```http
POST /api/Auth/login
```

Request body:

```json
{
  "email": "a@example.com",
  "password": "123456"
}
```

### Login with Google

```http
POST /api/Auth/google
```

### Refresh Token

```http
POST /api/Auth/refresh-token
```

### Logout

```http
POST /api/Auth/logout
```

---

## Users and Social API

### User Profile

```http
GET /api/Users/me
PATCH /api/Users/me
PATCH /api/Users/me/password
GET /api/users/{id}/profile
```

Update profile body (sample):

```json
{
  "fullName": "Updated Name",
  "phoneNumber": "0900000000",
  "avatarUrl": "https://...",
  "bio": "new bio"
}
```

### User Admin-style CRUD (used in FE service)

```http
GET /api/Users
POST /api/Users
GET /api/Users/{id}
```

### Public Search and Social

```http
GET /api/users/search
POST /api/Users/{id}/follow
DELETE /api/Users/{id}/follow
GET /api/Users/{id}/followers
GET /api/Users/{id}/following
GET /api/users/me/following/routines
POST /api/Users/{id}/block
DELETE /api/Users/{id}/block
GET /api/Users/me/blocks
```

---

## Friends API

```http
POST /api/friends/requests/{userId}
GET /api/friends/requests/incoming
GET /api/friends/requests/outgoing
POST /api/friends/requests/{id}/accept
POST /api/friends/requests/{id}/reject
DELETE /api/friends/requests/{id}
GET /api/friends
DELETE /api/friends/{userId}
```

---

## Categories API

```http
GET /api/Categories
POST /api/Categories
GET /api/Categories/{id}
PATCH /api/Categories/{id}
DELETE /api/Categories/{id}
```

---

## Routines API

### Routine CRUD

```http
GET /api/Routines/me
GET /api/Routines/today
GET /api/Routines/{id}
POST /api/Routines
PUT /api/Routines/{id}
DELETE /api/Routines/{id}
POST /api/Routines/{id}/copy
GET /api/Routines/search
GET /api/Routines/user/{userId}
```

### Tasks in Routine

```http
POST /api/Routines/{routineId}/tasks
PUT /api/Routines/{routineId}/tasks/{taskId}
DELETE /api/Routines/{routineId}/tasks/{taskId}
PUT /api/Routines/{routineId}/tasks/reorder
```

### Prepare Items

Task level:

```http
POST /api/Routines/{routineId}/tasks/{taskId}/prepare-items
PUT /api/Routines/{routineId}/tasks/{taskId}/prepare-items/{itemId}
DELETE /api/Routines/{routineId}/tasks/{taskId}/prepare-items/{itemId}
```

Routine level:

```http
POST /api/Routines/{routineId}/prepare-items
PUT /api/Routines/{routineId}/prepare-items/{itemId}
DELETE /api/Routines/{routineId}/prepare-items/{itemId}
```

---

## Task Logs API

```http
GET /api/TaskLogs/today
POST /api/TaskLogs/checkin
POST /api/TaskLogs/log
POST /api/TaskLogs/{id}/skip
PATCH /api/TaskLogs/{id}/evidence
DELETE /api/TaskLogs/{id}
```

Check-in body (sample):

```json
{
  "taskId": "uuid",
  "value": 1,
  "note": "done"
}
```

---

## Feed and Explore API

```http
GET /api/feed
GET /api/explore
GET /api/explore/routines
GET /api/explore/users
```

---

## Posts API

FE supports case fallback because some environments expose PascalCase routes.

Primary routes:

```http
GET /api/posts
GET /api/posts/{id}
POST /api/posts
DELETE /api/posts/{id}
POST /api/posts/{id}/like
GET /api/posts/{id}/likes
POST /api/posts/{id}/comments
GET /api/posts/{id}/comments
PATCH /api/posts/{id}/comments/{commentId}
DELETE /api/posts/{id}/comments/{commentId}
DELETE /api/admin/posts/{id}
DELETE /api/admin/comments/{id}
```

Fallback routes FE may call after `404/405`:

```http
/api/Posts...
/api/admin/Posts...
/api/admin/Comments...
```

---

## Chat API

```http
POST /api/chats/direct/{userId}
GET /api/chats/conversations
GET /api/chats/conversations/{conversationId}/messages
POST /api/chats/conversations/{conversationId}/messages
PATCH /api/chats/conversations/{conversationId}/read
DELETE /api/chats/messages/{messageId}
```

Send message payload generated by FE:

```json
{
  "type": "Text",
  "body": "Hello"
}
```

---

## Analytics API

```http
GET /api/analytics/me/overview
GET /api/analytics/me/streaks
GET /api/analytics/me/heatmap?year=2026
GET /api/analytics/me/routines
GET /api/analytics/me/routines/{id}
GET /api/analytics/me/tasks
GET /api/analytics/me/progress-chart
```

---

## Subscriptions and Payments API

### Subscription Plans

```http
GET /api/subscription-plans
POST /api/subscription-plans
GET /api/subscription-plans/{id}
PATCH /api/subscription-plans/{id}
DELETE /api/subscription-plans/{id}
```

### Subscriptions

```http
POST /api/subscriptions/checkout/{planId}
POST /api/subscriptions
GET /api/subscriptions
GET /api/subscriptions/me
POST /api/subscriptions/{id}/cancel
```

### Payments and Revenue

```http
GET /api/payments/me
GET /api/payments
GET /api/payments/return
GET /api/payments/revenue/summary
GET /api/payments/revenue/by-month
GET /api/payments/revenue/by-plan
GET /api/payments/revenue/top-plans
```

---

## Media API

```http
POST /api/media/sign-upload
```

Request body (sample):

```json
{
  "fileName": "avatar.png",
  "contentType": "image/png",
  "folder": "users"
}
```

---

## Admin API (Dedicated Module)

### Admin Categories

```http
POST /api/admin/categories
GET /api/admin/categories/{id}
PATCH /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

### Admin Users

```http
GET /api/admin/users
POST /api/admin/users
GET /api/admin/users/{id}
PATCH /api/admin/users/{id}
DELETE /api/admin/users/{id}
```

---

## Notes

- API list in this file is generated from current FE services at `src/services/api`.
- If backend route naming is changed, update FE services first, then regenerate this document.
- For payment return flow details, see `docs/FE_PAYMENT_INTEGRATION.md`.
