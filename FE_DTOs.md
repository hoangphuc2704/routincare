# FE DTOs Reference - Routin

> This document defines request/response DTO shapes expected by frontend.
> Source alignment: src/services/api/*.jsx and docs/FE_API.md.

---

## Auth DTOs

### LoginRequestDto

```typescript
interface LoginRequestDto {
  email: string;
  password: string;
}
```

### RegisterRequestDto

```typescript
interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

### SendOtpRequestDto

```typescript
interface SendOtpRequestDto {
  email: string;
}
```

### VerifyOtpRequestDto

```typescript
interface VerifyOtpRequestDto {
  email: string;
  code: string;
  fullName: string;
  password: string;
}
```

### GoogleLoginRequestDto

```typescript
interface GoogleLoginRequestDto {
  idToken: string;
}
```

### RefreshTokenRequestDto

```typescript
interface RefreshTokenRequestDto {
  refreshToken: string;
}
```

### TokenResponseDto

```typescript
interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
  roles?: string[];
}
```

---

## User DTOs

### UserDto

```typescript
interface UserDto {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  phoneNumber?: string | null;
  authProvider?: string | number;
  isEmailVerified?: boolean;
  createdAt: string;
}
```

### UpdateMeRequestDto

```typescript
interface UpdateMeRequestDto {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
}
```

### ChangePasswordRequestDto

```typescript
interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}
```

### SocialUserDto

```typescript
interface SocialUserDto {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  since?: string;
}
```

---

## Category DTOs

### CategoryDto

```typescript
interface CategoryDto {
  id: string;
  name: string;
  description?: string | null;
  iconName?: string | null;
  colorHex?: string | null;
  sortOrder?: number;
  isSystem?: boolean;
  createdAt?: string;
}
```

### UpsertCategoryRequestDto

```typescript
interface UpsertCategoryRequestDto {
  name: string;
  description?: string;
  iconName?: string;
  colorHex?: string;
  sortOrder?: number;
}
```

---

## Routine DTOs

### RoutineDto

```typescript
interface RoutineDto {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  themeColor?: string | null;
  categoryId?: string;
  category?: CategoryDto | null;
  repeatType?: number;
  repeatDays?: string | null;
  remindTime?: string | null;
  visibility?: number;
  createdAt: string;
  tasks?: RoutineTaskDto[];
  prepareItems?: PrepareItemDto[];
}
```

### CreateRoutineRequestDto

```typescript
interface CreateRoutineRequestDto {
  title: string;
  description?: string;
  themeColor?: string;
  categoryId: string;
  repeatType?: number;
  repeatDays?: string;
  remindTime?: string;
  visibility?: number;
}
```

### UpdateRoutineRequestDto

```typescript
interface UpdateRoutineRequestDto {
  title?: string;
  description?: string;
  themeColor?: string;
  categoryId?: string;
  repeatType?: number;
  repeatDays?: string;
  remindTime?: string;
  visibility?: number;
}
```

---

## Routine Task and Prepare Item DTOs

### RoutineTaskDto

```typescript
interface RoutineTaskDto {
  id: string;
  routineId: string;
  title: string;
  note?: string | null;
  unit?: string | null;
  targetValue?: number | null;
  sortOrder?: number;
  prepareItems?: PrepareItemDto[];
}
```

### UpsertRoutineTaskRequestDto

```typescript
interface UpsertRoutineTaskRequestDto {
  title: string;
  note?: string;
  unit?: string;
  targetValue?: number;
  sortOrder?: number;
}
```

### ReorderTasksRequestDto

```typescript
interface ReorderTasksRequestDto {
  taskOrders: Array<{
    taskId: string;
    sortOrder: number;
  }>;
}
```

### PrepareItemDto

```typescript
interface PrepareItemDto {
  id: string;
  name: string;
  quantity?: number | null;
  unit?: string | null;
  isChecked?: boolean;
}
```

### UpsertPrepareItemRequestDto

```typescript
interface UpsertPrepareItemRequestDto {
  name: string;
  quantity?: number;
  unit?: string;
}
```

---

## Task Log DTOs

### TaskLogDto

```typescript
interface TaskLogDto {
  id: string | number;
  taskId: string;
  userId: string;
  logDate: string;
  currentValue?: number;
  status?: number;
  evidenceUrl?: string | null;
  lastUpdated?: string | null;
}
```

### TaskCheckinRequestDto

```typescript
interface TaskCheckinRequestDto {
  taskId: string;
  value?: number;
  note?: string;
}
```

### TaskLogQuantityRequestDto

```typescript
interface TaskLogQuantityRequestDto {
  taskId: string;
  value: number;
}
```

### UpdateEvidenceRequestDto

```typescript
interface UpdateEvidenceRequestDto {
  evidenceUrl: string;
}
```

---

## Feed and Post DTOs

### FeedItemDto

```typescript
interface FeedItemDto {
  id: string;
  type?: 'Routine' | 'Post' | string;
  createdAt: string;
  user: SocialUserDto;
}
```

### PostDto

```typescript
interface PostDto {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string | null;
  likesCount?: number;
  commentsCount?: number;
  createdAt: string;
  updatedAt?: string;
}
```

### CreatePostRequestDto

```typescript
interface CreatePostRequestDto {
  content: string;
  mediaUrl?: string;
  routineId?: string;
}
```

### CommentDto

```typescript
interface CommentDto {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
```

### CreateCommentRequestDto

```typescript
interface CreateCommentRequestDto {
  content: string;
}
```

### UpdateCommentRequestDto

```typescript
interface UpdateCommentRequestDto {
  content: string;
}
```

---

## Chat DTOs

### ConversationDto

```typescript
interface ConversationDto {
  id: string;
  type: 'Direct' | 'Group' | string;
  participants: SocialUserDto[];
  lastMessage?: MessageDto | null;
  unreadCount?: number;
  updatedAt: string;
}
```

### MessageDto

```typescript
interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'Text' | string;
  body: string;
  createdAt: string;
  isRead?: boolean;
}
```

### SendMessageRequestDto

```typescript
interface SendMessageRequestDto {
  type: 'Text';
  body: string;
}
```

### MarkAsReadRequestDto

```typescript
interface MarkAsReadRequestDto {
  messageIds?: string[];
  readToMessageId?: string;
}
```

---

## Analytics DTOs

### AnalyticsOverviewDto

```typescript
interface AnalyticsOverviewDto {
  completedTasks: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}
```

### HeatmapPointDto

```typescript
interface HeatmapPointDto {
  date: string;
  count: number;
}
```

### ProgressPointDto

```typescript
interface ProgressPointDto {
  date: string;
  value: number;
}
```

---

## Subscription and Payment DTOs

### SubscriptionPlanDto

```typescript
interface SubscriptionPlanDto {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: number;
  features: string[];
}
```

### CreateSubscriptionRequestDto

```typescript
interface CreateSubscriptionRequestDto {
  planId: string;
}
```

### CheckoutResponseDto

```typescript
interface CheckoutResponseDto {
  checkoutUrl: string;
  orderCode: number;
  transactionId: string;
  amount: number;
  currency: string;
}
```

### SubscriptionDto

```typescript
interface SubscriptionDto {
  id: string;
  userId: string;
  planId: string;
  status: 'Active' | 'Expired' | 'Cancelled' | string;
  startedAt: string;
  expiresAt: string;
}
```

### PaymentDto

```typescript
interface PaymentDto {
  id: string;
  orderCode: number;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}
```

---

## Media DTOs

### SignUploadRequestDto

```typescript
interface SignUploadRequestDto {
  fileName: string;
  contentType: string;
  folder?: string;
}
```

### SignUploadResponseDto

```typescript
interface SignUploadResponseDto {
  uploadUrl: string;
  publicUrl: string;
  fields?: Record<string, string>;
}
```

---

## API Wrapper DTOs

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
}
```

---

## Enum Suggestions

```typescript
enum RepeatType {
  Daily = 0,
  Weekly = 1,
}

enum RoutineVisibility {
  Private = 0,
  Public = 1,
  SubscribersOnly = 2,
}

enum TaskLogStatus {
  InProgress = 0,
  Completed = 1,
  Skipped = 2,
}
```

---

## Usage Note

- DTOs in this file are FE integration contracts and can evolve with backend.
- Keep this file in sync with FE service modules and backend API changes.
