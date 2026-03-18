# DTOs Reference - Routin API

> Tài liệu này mô tả các Data Transfer Objects (DTOs) được sử dụng trong API.

---

## 👤 User DTOs

### UserDto (Response)
Dùng khi trả về thông tin User.

```typescript
interface UserDto {
  id: string;           // UUID
  fullName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  authProvider: AuthProvider;  // 0: Local, 1: Google
  isEmailVerified: boolean;
  createdAt: string;    // ISO 8601
}
```

### CreateUserDto (Request)
Dùng khi tạo User mới.

```typescript
interface CreateUserDto {
  fullName: string;     // Required
  email: string;        // Required, valid email
  password: string;     // Required, min 6 chars
}
```

### UpdateUserDto (Request)
Dùng khi cập nhật User.

```typescript
interface UpdateUserDto {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}
```

---

## 🏷️ Category DTOs

### CategoryDto (Response)
Dùng khi trả về thông tin Category.

```typescript
interface CategoryDto {
  id: string;              // UUID
  name: string;
  description: string | null;
  iconName: string | null;
  colorHex: string | null; // Hex: #FF5733
  sortOrder: number;
  isSystem: boolean;       // true = system-defined, false = user-defined
  createdAt: string;       // ISO 8601
}
```

### CreateCategoryDto (Request)
Dùng khi tạo Category mới.

```typescript
interface CreateCategoryDto {
  name: string;            // Required, max 100 chars, unique
  description?: string;    // Optional, max 500 chars
  iconName?: string;       // Optional, max 50 chars
  colorHex?: string;       // Optional, max 7 chars
  sortOrder?: number;      // Default: 0
}
```

### UpdateCategoryDto (Request)
Dùng khi cập nhật Category.

```typescript
interface UpdateCategoryDto {
  name?: string;
  description?: string;
  iconName?: string;
  colorHex?: string;
  sortOrder?: number;
}
```

---

## 📋 Routine DTOs

### RoutineDto (Response)
Dùng khi trả về thông tin Routine.

```typescript
interface RoutineDto {
  id: string;              // UUID
  creatorId: string;       // UUID
  title: string;
  description: string | null;
  themeColor: string | null;  // Hex: #FF5733
  categoryId: string;         // UUID - FK to Categories
  category: CategoryDto | null;  // Nested category object
  repeatType: RepeatType;     // 0: Daily, 1: Weekly
  repeatDays: string | null;  // "2,4,6" for Weekly
  remindTime: string | null;  // "08:00:00"
  visibility: RoutineVisibility;
  createdAt: string;
}
```

### CreateRoutineDto (Request)
Dùng khi tạo Routine mới.

```typescript
interface CreateRoutineDto {
  title: string;              // Required, max 200 chars
  description?: string;
  themeColor?: string;
  categoryId: string;         // Required, UUID of existing Category
  repeatType?: RepeatType;    // Default: 0 (Daily)
  repeatDays?: string;        // Required if repeatType = 1 (Weekly)
  remindTime?: string;        // Format: "HH:mm:ss"
  visibility?: RoutineVisibility; // Default: 1 (Public)
}
```

### UpdateRoutineDto (Request)
Dùng khi cập nhật Routine (partial update).

```typescript
interface UpdateRoutineDto {
  title?: string;
  description?: string;
  themeColor?: string;
  categoryId?: string;        // UUID
  repeatType?: RepeatType;
  repeatDays?: string;
  remindTime?: string;
  visibility?: RoutineVisibility;
}
```

---

## ✅ TaskLog DTOs (Coming Soon)

### TaskLogDto
```typescript
interface TaskLogDto {
  id: number;
  taskId: string;
  userId: string;
  logDate: string;        // "2026-01-23"
  currentValue: number;
  status: TaskLogStatus;  // 0: InProgress, 1: Completed, 2: Skipped
  evidenceUrl: string | null;
  lastUpdated: string | null;
}
```

---

## 🎯 Enum Types (TypeScript)

```typescript
enum AuthProvider {
  Local = 0,
  Google = 1
}

enum RepeatType {
  Daily = 0,
  Weekly = 1
}

enum RoutineVisibility {
  Private = 0,
  Public = 1,
  SubscribersOnly = 2
}

enum TaskLogStatus {
  InProgress = 0,
  Completed = 1,
  Skipped = 2
}

enum SubscriptionStatus {
  Active = 0,
  Expired = 1,
  Cancelled = 2
}
```


---

## 📦 API Response Wrapper

Mọi response đều được wrap:

```typescript
// Success case
interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
}

// Error case
interface ApiErrorResponse {
  success: false;
  message: string;
}
```

### Usage Example (React Native)
```typescript
const response = await fetch('/api/users');
const result = await response.json();

if (result.success) {
  // Handle data
  const users: UserDto[] = result.data;
} else {
  // Show error
  Alert.alert('Error', result.message);
}
```
