# Routin API Documentation

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:5000/api`  
> **Last Updated:** 2026-01-24

---

## 📦 Response Format

Tất cả API đều trả về format thống nhất:

### Success Response (2xx)

```json
{
  "success": true,
  "data": { ... },
  "message": "User created successfully."
}
```

### Error Response (4xx, 5xx)

```json
{
  "success": false,
  "message": "Email already exists."
}
```

### HTTP Status Codes

| Code | Meaning                            |
| ---- | ---------------------------------- |
| 200  | OK - Request thành công            |
| 201  | Created - Tạo mới thành công       |
| 204  | No Content - Xóa thành công        |
| 400  | Bad Request - Dữ liệu không hợp lệ |
| 401  | Unauthorized - Chưa đăng nhập      |
| 403  | Forbidden - Không có quyền         |
| 404  | Not Found - Không tìm thấy         |
| 409  | Conflict - Dữ liệu đã tồn tại      |
| 500  | Internal Server Error              |

---

## 🔐 Authentication API

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**

```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| fullName | Required, Max 100 chars |
| email | Required, Valid email format |
| password | Required, Min 6 chars |
| confirmPassword | Required, Must match password |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "base64-encoded-refresh-token...",
    "expiresAt": "2026-01-24T20:00:00Z",
    "user": {
      "id": "uuid",
      "fullName": "Nguyen Van A",
      "email": "a@example.com",
      ...
    }
  },
  "message": "User created successfully."
}
```

---

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "a@example.com",
  "password": "123456"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "base64-encoded-refresh-token...",
    "expiresAt": "2026-01-24T20:00:00Z",
    "user": {
      "id": "uuid",
      "fullName": "Nguyen Van A",
      "email": "a@example.com",
      ...
    }
  },
  "message": ""
}
```

**Response (401 - Invalid credentials):**

```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

### Refresh Token

```http
POST /api/auth/refresh-token
Content-Type: application/json
```

**Request Body:**

```json
{
  "refreshToken": "base64-encoded-refresh-token..."
}
```

---

## 👤 Users API (Protected)

> ⚠️ **Authorization Header Required:**
>
> ```
> Authorization: Bearer <access_token>
> ```

### Get All Users

```http
GET /api/users
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "Nguyen Van A",
      "email": "a@example.com",
      "avatarUrl": "https://...",
      "bio": "Hello world",
      "authProvider": 0,
      "isEmailVerified": true,
      "createdAt": "2026-01-23T00:00:00Z"
    }
  ],
  "message": ""
}
```

---

### Get User by ID

```http
GET /api/users/{id}
Authorization: Bearer <token>
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | uuid | ✅ | User ID |

---

### Create User (Admin)

```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "password": "123456"
}
```

---

## 🏷️ Categories API (Public Read / Protected Write)

> Categories bây giờ là bảng riêng trong database, không còn là enum.

### Get All Categories (Public)

```http
GET /api/categories
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Health",
      "description": "Health and fitness routines",
      "iconName": "heart",
      "colorHex": "#FF5733",
      "sortOrder": 0,
      "isSystem": true,
      "createdAt": "2026-01-24T00:00:00Z"
    }
  ],
  "message": ""
}
```

---

### Get Category by ID (Public)

```http
GET /api/categories/{id}
```

---

### Create Category (Protected)

```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Morning Routine",
  "description": "Daily morning habits",
  "iconName": "sun",
  "colorHex": "#FFC107",
  "sortOrder": 10
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| name | Required, Max 100 chars, Unique |
| description | Optional, Max 500 chars |
| colorHex | Optional, Max 7 chars (Hex) |

---

### Update Category (Protected)

```http
PUT /api/categories/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (Partial update)

```json
{
  "name": "Evening Routine",
  "colorHex": "#9C27B0"
}
```

---

### Delete Category (Protected)

```http
DELETE /api/categories/{id}
Authorization: Bearer <token>
```

**Response (204):** No Content

**Response (400):** Category đang được sử dụng bởi Routines

```json
{
  "success": false,
  "message": "Cannot delete category that is in use by routines."
}
```

---

## 📋 Routines API (Protected)

> ⚠️ **Authorization Required cho tất cả endpoints**

### Get All Routines

Lấy tất cả routines của user hiện tại.

```http
GET /api/routines
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "creatorId": "uuid",
      "title": "Morning Workout",
      "description": "30 phút tập thể dục",
      "themeColor": "#FF5733",
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "name": "Health",
        "colorHex": "#FF5733"
      },
      "repeatType": 0,
      "repeatDays": null,
      "remindTime": "07:00:00",
      "visibility": 1,
      "createdAt": "2026-01-24T00:00:00Z"
    }
  ],
  "message": ""
}
```

---

### Get Routine by ID

```http
GET /api/routines/{id}
Authorization: Bearer <token>
```

---

### Create Routine

```http
POST /api/routines
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Morning Workout",
  "description": "30 phút tập thể dục mỗi sáng",
  "themeColor": "#FF5733",
  "categoryId": "uuid-of-category",
  "repeatType": 0,
  "repeatDays": null,
  "remindTime": "07:00:00",
  "visibility": 1
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| title | Required, Max 200 chars |
| categoryId | Required, UUID |
| repeatType | 0: Daily, 1: Weekly |
| visibility | 0: Private, 1: Public, 2: SubscribersOnly |

**Response (201):**

```json
{
  "success": true,
  "data": { ... },
  "message": "Routine created successfully."
}
```

---

### Update Routine

```http
PUT /api/routines/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (Partial update - chỉ gửi fields cần update)

```json
{
  "title": "Evening Workout",
  "remindTime": "18:00:00"
}
```

---

### Delete Routine

```http
DELETE /api/routines/{id}
Authorization: Bearer <token>
```

**Response (204):** No Content

---

## 📊 Enums Reference

### AuthProvider

| Value | Name   | Description                 |
| ----- | ------ | --------------------------- |
| 0     | Local  | Đăng ký bằng Email/Password |
| 1     | Google | Đăng nhập bằng Google       |

### RepeatType

| Value | Name   | Description |
| ----- | ------ | ----------- |
| 0     | Daily  | Hàng ngày   |
| 1     | Weekly | Theo thứ    |

### RoutineVisibility

| Value | Name            | Description            |
| ----- | --------------- | ---------------------- |
| 0     | Private         | Chỉ mình tôi           |
| 1     | Public          | Công khai              |
| 2     | SubscribersOnly | Chỉ người theo dõi     |

### TaskLogStatus

| Value | Name       |
| ----- | ---------- |
| 0     | InProgress |
| 1     | Completed  |
| 2     | Skipped    |

---

## 📝 Notes for Frontend Devs

1. **Luôn check `success` field** trước khi xử lý `data`.
2. **Hiển thị `message`** cho user khi có lỗi.
3. **UUID format** cho tất cả ID.
4. **DateTime format:** ISO 8601 (UTC).
5. **Bearer Token:** Lưu `accessToken` và gửi trong header `Authorization: Bearer <token>`.
6. **Token Expiration:** Kiểm tra `expiresAt` để biết khi nào cần refresh.
7. **CategoryId là bắt buộc** khi tạo Routine - lấy danh sách categories từ `/api/categories`.

