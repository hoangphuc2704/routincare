# FE vs Backend API Coverage

Tai lieu nay doi chieu endpoint FE dang goi trong [src/api](../src/api) voi backend API Specification trong [docs/Api Specification](./Api%20Specification).

## 1. Scope va nguon doi chieu

- FE source: [src/api/adminApi.jsx](../src/api/adminApi.jsx), [src/api/analyticsApi.jsx](../src/api/analyticsApi.jsx), [src/api/authApi.jsx](../src/api/authApi.jsx), [src/api/categoryApi.jsx](../src/api/categoryApi.jsx), [src/api/chatApi.jsx](../src/api/chatApi.jsx), [src/api/friendApi.jsx](../src/api/friendApi.jsx), [src/api/mediaApi.jsx](../src/api/mediaApi.jsx), [src/api/paymentApi.jsx](../src/api/paymentApi.jsx), [src/api/routineApi.jsx](../src/api/routineApi.jsx), [src/api/subscriptionApi.jsx](../src/api/subscriptionApi.jsx), [src/api/taskLogApi.jsx](../src/api/taskLogApi.jsx), [src/api/userApi.jsx](../src/api/userApi.jsx)
- Backend source: [docs/Api Specification](./Api%20Specification)
- Ghi chu:
  - FE goi endpoint voi prefix `/api/...`.
  - Backend spec dung path dang `/...` (khong co `/api` prefix).
  - Mot so endpoint FE dung PascalCase (`/api/Auth`, `/api/Users`, `/api/Routines`, `/api/TaskLogs`). Neu backend route case-sensitive, can chuan hoa ve lowercase.

## 2. Coverage tong quan theo module

| Module | Backend spec | FE da noi | Tinh trang |
| --- | ---: | ---: | --- |
| Auth | 8 | 7 | Gan du, thieu resend OTP |
| User Profile | 7 | 7 | Day du |
| Categories | 4 (+compat routes) | 5 | Day du core, co them getById ngoai spec |
| Routine + Task | 11 | 16 | Day du core, thieu search, co them prepare-items |
| Task Tracking | 6 | 6 | Day du |
| Subscription + Payment | 14 (implemented + pending) | 12 | Day du phan user/admin co FE, chua co webhook/callback |
| Social Follow/Block | 7 | 7 | Day du |
| Friendship | 8 | 8 | Day du |
| Chat Direct | 6 | 6 | Day du |
| Analytics (user) | 7 | 7 | Day du |
| Admin Management | 12 | 3 (+5 category admin) | Moi noi mot phan |
| Feed/Posts/Reels/Creator/Notifications | nhieu endpoint pending | 0 | Chua co FE API wrappers |

## 3. Chi tiet doi chieu

## 3.1 Auth

Backend spec:
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/register/otp/send`
- POST `/auth/register/otp/resend`
- POST `/auth/register/otp/verify`
- POST `/auth/google`
- POST `/auth/refresh-token`
- POST `/auth/logout`

FE da noi:
- POST `/api/Auth/register`
- POST `/api/Auth/login`
- POST `/api/Auth/register/otp/send`
- POST `/api/Auth/register/otp/verify`
- POST `/api/Auth/google`
- POST `/api/Auth/refresh-token`
- POST `/api/Auth/logout`

Chua thay FE:
- POST `/auth/register/otp/resend`

## 3.2 User Profile + Social Follow/Block

Backend spec (User Profile):
- GET `/users`
- GET `/users/:id`
- GET `/users/search`
- GET `/users/me`
- PATCH `/users/me`
- PATCH `/users/me/password`
- GET `/users/:id/profile`

FE da noi:
- GET `/api/Users`
- POST `/api/Users`
- GET `/api/Users/:id`
- GET `/api/users/search`
- GET `/api/Users/me`
- PATCH `/api/Users/me`
- PATCH `/api/Users/me/password`
- GET `/api/users/:id/profile`

Backend spec (Follow/Block):
- POST `/users/:id/follow`
- DELETE `/users/:id/follow`
- GET `/users/:id/followers`
- GET `/users/:id/following`
- POST `/users/:id/block`
- DELETE `/users/:id/block`
- GET `/users/me/blocks`

FE da noi:
- POST `/api/Users/:id/follow`
- DELETE `/api/Users/:id/follow`
- GET `/api/Users/:id/followers`
- GET `/api/Users/:id/following`
- POST `/api/Users/:id/block`
- DELETE `/api/Users/:id/block`
- GET `/api/Users/me/blocks`

## 3.3 Categories

Backend spec core:
- GET `/categories`
- POST `/admin/categories`
- PATCH `/admin/categories/:id`
- DELETE `/admin/categories/:id`

FE da noi:
- GET `/api/Categories`
- POST `/api/Categories` (compat route)
- GET `/api/Categories/:id` (khong nam trong spec hien tai)
- PATCH `/api/Categories/:id` (compat route)
- DELETE `/api/Categories/:id` (compat route)
- GET `/api/admin/categories`
- POST `/api/admin/categories`
- GET `/api/admin/categories/:id` (khong nam trong spec hien tai)
- PATCH `/api/admin/categories/:id`
- DELETE `/api/admin/categories/:id`

## 3.4 Routine + Task

Backend spec (Routine):
- GET `/routines/me`
- GET `/routines/today`
- GET `/routines/search`
- GET `/routines/:id`
- POST `/routines`
- PUT `/routines/:id`
- DELETE `/routines/:id`
- POST `/routines/:id/copy`

FE da noi:
- GET `/api/Routines/me`
- GET `/api/Routines/today`
- GET `/api/Routines/:id`
- POST `/api/Routines`
- PUT `/api/Routines/:id`
- DELETE `/api/Routines/:id`
- POST `/api/Routines/:id/copy`

Backend spec (Task):
- POST `/routines/:routineId/tasks`
- PUT `/routines/:routineId/tasks/:taskId`
- DELETE `/routines/:routineId/tasks/:taskId`
- PUT `/routines/:routineId/tasks/reorder`

FE da noi:
- POST `/api/Routines/:routineId/tasks`
- PUT `/api/Routines/:routineId/tasks/:taskId`
- DELETE `/api/Routines/:routineId/tasks/:taskId`
- PUT `/api/Routines/:routineId/tasks/reorder`

Chua thay FE:
- GET `/routines/search`

FE dang goi them (khong thay trong backend spec file nay):
- POST `/api/Routines/:routineId/tasks/:taskId/prepare-items`
- PUT `/api/Routines/:routineId/tasks/:taskId/prepare-items/:itemId`
- DELETE `/api/Routines/:routineId/tasks/:taskId/prepare-items/:itemId`
- POST `/api/Routines/:routineId/prepare-items`
- PUT `/api/Routines/:routineId/prepare-items/:itemId`
- DELETE `/api/Routines/:routineId/prepare-items/:itemId`

## 3.5 Task Tracking

Backend spec:
- GET `/task-logs/today`
- POST `/task-logs/checkin`
- POST `/task-logs/log`
- POST `/task-logs/:id/skip`
- PATCH `/task-logs/:id/evidence`
- DELETE `/task-logs/:id`

FE da noi:
- GET `/api/TaskLogs/today`
- POST `/api/TaskLogs/checkin`
- POST `/api/TaskLogs/log`
- POST `/api/TaskLogs/:id/skip`
- PATCH `/api/TaskLogs/:id/evidence`
- DELETE `/api/TaskLogs/:id`

## 3.6 Subscription + Payment

Backend implemented:
- Subscription plans: GET/GET:id/POST/PATCH/DELETE `/subscription-plans`
- Subscriptions: POST `/subscriptions`, POST `/subscriptions/checkout/:planId`, GET `/subscriptions/me`, POST `/subscriptions/:id/cancel`, GET `/subscriptions`
- Payment: GET `/payments/me`, GET `/payments`
- Webhook: POST `/subscriptions/webhook/payos`

Backend pending:
- POST `/payments/callback/vnpay`
- POST `/payments/callback/momo`
- POST `/payments/verify`

FE da noi:
- GET `/api/subscription-plans`
- GET `/api/subscription-plans/:id`
- POST `/api/subscription-plans`
- PATCH `/api/subscription-plans/:id`
- DELETE `/api/subscription-plans/:id`
- POST `/api/subscriptions`
- POST `/api/subscriptions/checkout/:planId`
- GET `/api/subscriptions/me`
- POST `/api/subscriptions/:id/cancel`
- GET `/api/subscriptions`
- GET `/api/payments/me`
- GET `/api/payments`

Chua co FE wrapper (thuong la backend-to-backend):
- POST `/subscriptions/webhook/payos`
- POST `/payments/callback/vnpay`
- POST `/payments/callback/momo`
- POST `/payments/verify`

## 3.7 Friendship

Backend spec:
- POST `/friends/requests/:userId`
- GET `/friends/requests/incoming`
- GET `/friends/requests/outgoing`
- POST `/friends/requests/:id/accept`
- POST `/friends/requests/:id/reject`
- DELETE `/friends/requests/:id`
- GET `/friends`
- DELETE `/friends/:userId`

FE da noi day du 8/8 endpoint tuong ung trong [src/api/friendApi.jsx](../src/api/friendApi.jsx).

## 3.8 Chat Direct

Backend spec:
- POST `/chats/direct/:userId`
- GET `/chats/conversations`
- GET `/chats/conversations/:id/messages`
- POST `/chats/conversations/:id/messages`
- PATCH `/chats/conversations/:id/read`
- DELETE `/chats/messages/:id`

FE da noi day du 6/6 endpoint tuong ung trong [src/api/chatApi.jsx](../src/api/chatApi.jsx).

Ghi chu:
- Realtime hub `/hubs/chat` chua co wrapper trong [src/api](../src/api) (thuong nam o service SignalR rieng).

## 3.9 Analytics (User scope)

Backend spec:
- GET `/analytics/me/overview`
- GET `/analytics/me/streaks`
- GET `/analytics/me/heatmap`
- GET `/analytics/me/routines`
- GET `/analytics/me/routines/:id`
- GET `/analytics/me/tasks`
- GET `/analytics/me/progress-chart`

FE da noi day du 7/7 endpoint tuong ung trong [src/api/analyticsApi.jsx](../src/api/analyticsApi.jsx).

## 3.10 Media

Backend spec:
- POST `/media/sign-upload`

FE da noi:
- POST `/api/media/sign-upload`

## 3.11 Admin Management (ngoai users/categories)

Backend spec co nhieu endpoint admin dang IN PROGRESS/PENDING:
- `/admin/dashboard`
- `/admin/dashboard/revenue`
- `/admin/dashboard/engagement`
- `/admin/routines`
- `/admin/routines/:id/moderate`
- `/admin/reports`
- `/admin/reports/:id`
- `/admin/subscriptions`
- `/admin/payments`

FE hien chua co wrappers cho cac endpoint tren trong [src/api](../src/api).

## 3.12 Feed, Posts, Reels, Creator, Notifications

Theo backend spec, cac module nay chua thay FE wrapper trong [src/api](../src/api):
- Feed/Explore
- Posts/Comments/Likes
- Reels
- Creator dashboard
- Notifications

## 4. De xuat uu tien bo sung FE wrappers

1. Auth: them `resendOtp` cho `/auth/register/otp/resend`.
2. Routine: them `searchRoutines` cho `/routines/search`.
3. Admin dashboard: bo sung API wrappers cho cac endpoint admin thong ke va moderation.
4. Notifications: tao `notificationApi.jsx` de san sang cho phase tiep theo.
5. Neu backend route co phan biet hoa-thuong, chuan hoa tat ca endpoint FE ve lowercase.
