1. Auth – Đăng ký, đăng nhập
1.1 Đăng nhập: POST /api/Auth/login
Mục đích: Cho user đăng nhập bằng email + mật khẩu để lấy accessToken, refreshToken.
​

Dùng ở: Màn “Đăng nhập”.

Request

json
POST /api/Auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}
Response OK (200)

json
{
  "user": {
    "id": "c3f5bbde-9c1e-4d7a-9e73-1f21a3a5f001",
    "email": "user@example.com",
    "displayName": "Nguyễn Hoàng Phúc",
    "avatarUrl": "https://cdn.routin.app/avatars/123.png"
  },
  "accessToken": "<jwt-access-token>",
  "refreshToken": "<refresh-token>",
  "expiresIn": 3600
}
1.2 Đăng ký qua OTP
1.2.1 Gửi OTP: POST /api/Auth/register/otp/send
Mục đích: Gửi mã OTP đến email khi user bắt đầu đăng ký.
​

Dùng ở: Màn “Nhập email để đăng ký”.

json
POST /api/Auth/register/otp/send
Content-Type: application/json

{
  "email": "user@example.com"
}
Response 200: { "message": "OTP has been sent to your email." }

1.2.2 Gửi lại OTP: POST /api/Auth/register/otp/resend
Giống send, nhưng thường yêu cầu giới hạn thời gian (rate limit).
​

json
POST /api/Auth/register/otp/resend

{
  "email": "user@example.com"
}
1.2.3 Xác thực OTP & tạo account: POST /api/Auth/register/otp/verify
Mục đích: Xác thực OTP, đồng thời hoàn tất tạo user (mật khẩu, tên hiển thị).
​

json
POST /api/Auth/register/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "password": "P@ssw0rd!",
  "displayName": "Nguyễn Hoàng Phúc"
}
Response 201

json
{
  "user": {
    "id": "c3f5bbde-9c1e-4d7a-9e73-1f21a3a5f001",
    "email": "user@example.com",
    "displayName": "Nguyễn Hoàng Phúc"
  },
  "accessToken": "<jwt-access-token>",
  "refreshToken": "<refresh-token>"
}
1.3 Refresh token: POST /api/Auth/refresh-token
Dùng ở: interceptor khi API trả 401 vì token hết hạn.
​

json
POST /api/Auth/refresh-token

{
  "refreshToken": "<refresh-token>"
}
Response

json
{
  "accessToken": "<new-access-token>",
  "refreshToken": "<new-refresh-token>",
  "expiresIn": 3600
}
2. Users – Hồ sơ, follow, block
2.1 Lấy profile của chính mình: GET /api/Users/me
Dùng ở: Khi app mở lên lần đầu sau login để load profile.
​

Request

text
GET /api/Users/me
Authorization: Bearer <access-token>
Response

json
{
  "id": "c3f5bbde-9c1e-4d7a-9e73-1f21a3a5f001",
  "email": "user@example.com",
  "displayName": "Nguyễn Hoàng Phúc",
  "avatarUrl": "https://cdn.routin.app/avatars/123.png",
  "bio": "Yêu đọc sách và chạy bộ.",
  "createdAt": "2026-03-01T10:00:00Z"
}
2.2 Cập nhật profile: PATCH /api/Users/me
json
PATCH /api/Users/me
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "displayName": "Phúc Nguyễn",
  "avatarUrl": "https://cdn.routin.app/avatars/456.png",
  "bio": "Fullstack dev, thích tạo habit mới."
}
Response

json
{
  "id": "c3f5bbde-9c1e-4d7a-9e73-1f21a3a5f001",
  "email": "user@example.com",
  "displayName": "Phúc Nguyễn",
  "avatarUrl": "https://cdn.routin.app/avatars/456.png",
  "bio": "Fullstack dev, thích tạo habit mới."
}
2.3 Follow / Unfollow
Follow: POST /api/Users/{id}/follow
text
POST /api/Users/45f2.../follow
Authorization: Bearer <access-token>
Response:

json
{
  "targetUserId": "45f2...",
  "isFollowing": true
}
Unfollow: DELETE /api/Users/{id}/follow
text
DELETE /api/Users/45f2.../follow
Authorization: Bearer <access-token>
Response:

json
{
  "targetUserId": "45f2...",
  "isFollowing": false
}
3. Routines – Thiết kế chi tiết 1 routine
3.1 Tạo routine: POST /api/Routines
Use case: Màn “Tạo thói quen buổi sáng”.
​

json
POST /api/Routines
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Morning Routine",
  "description": "Chuỗi việc làm mỗi sáng",
  "schedule": {
    "type": "Daily",
    "daysOfWeek": null
  },
  "remindAt": "06:30",
  "visibility": "Private",
  "categoryId": "9a21..."
}
Response

json
{
  "id": "rtn-001",
  "name": "Morning Routine",
  "description": "Chuỗi việc làm mỗi sáng",
  "schedule": {
    "type": "Daily",
    "daysOfWeek": null
  },
  "remindAt": "06:30",
  "visibility": "Private",
  "categoryId": "9a21...",
  "tasks": []
}
3.2 Thêm task vào routine: POST /api/Routines/{routineId}/tasks
json
POST /api/Routines/rtn-001/tasks
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Uống nước",
  "type": "Quantity",
  "targetValue": 2000,
  "unit": "ml",
  "order": 1
}
Response:

json
{
  "id": "task-01",
  "name": "Uống nước",
  "type": "Quantity",
  "targetValue": 2000,
  "unit": "ml",
  "order": 1
}
3.3 Đổi thứ tự tasks: PUT /api/Routines/{routineId}/tasks/reorder
json
PUT /api/Routines/rtn-001/tasks/reorder
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "taskIds": [
    "task-02",
    "task-01",
    "task-03"
  ]
}
Response: { "success": true }

4. Prepare Items – Ví dụ chi tiết
4.1 Thêm item chuẩn bị cho routine
json
POST /api/Routines/rtn-001/prepare-items
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Chuẩn bị chai nước",
  "description": "Đặt sẵn chai nước ở bàn học"
}
Response:

json
{
  "id": "prep-01",
  "name": "Chuẩn bị chai nước",
  "description": "Đặt sẵn chai nước ở bàn học",
  "scope": "Routine",
  "routineId": "rtn-001",
  "taskId": null
}
4.2 Thêm item chuẩn bị cho task
json
POST /api/Routines/rtn-001/tasks/task-01/prepare-items
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Mở app đếm thời gian",
  "description": "Sẵn sàng bấm để log"
}
5. TaskLogs – Check-in từng ngày
5.1 Lấy danh sách task hôm nay: GET /api/TaskLogs/today
text
GET /api/TaskLogs/today
Authorization: Bearer <access-token>
Response (ví dụ rút gọn):

json
[
  {
    "id": "log-01",
    "date": "2026-03-18",
    "routineId": "rtn-001",
    "routineName": "Morning Routine",
    "taskId": "task-01",
    "taskName": "Uống nước",
    "type": "Quantity",
    "targetValue": 2000,
    "loggedValue": 0,
    "status": "Pending"
  },
  {
    "id": "log-02",
    "date": "2026-03-18",
    "routineId": "rtn-001",
    "taskId": "task-02",
    "taskName": "Thiền 10 phút",
    "type": "Checkbox",
    "status": "Done"
  }
]
5.2 Check-in task checkbox: POST /api/TaskLogs/checkin
json
POST /api/TaskLogs/checkin
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "taskId": "task-02",
  "date": "2026-03-18"
}
Response:

json
{
  "id": "log-02",
  "taskId": "task-02",
  "status": "Done",
  "date": "2026-03-18"
}
5.3 Log số lượng: POST /api/TaskLogs/log
json
POST /api/TaskLogs/log
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "taskId": "task-01",
  "date": "2026-03-18",
  "value": 1500
}
6. Analytics – Data mẫu để vẽ chart
6.1 Overview: GET /api/analytics/me/overview
text
GET /api/analytics/me/overview
Authorization: Bearer <access-token>
Response:

json
{
  "totalRoutines": 5,
  "totalTasks": 18,
  "activeDays": 27,
  "completionRate": 0.78,
  "currentStreak": 5,
  "longestStreak": 12
}
6.2 Heatmap: GET /api/analytics/me/heatmap
json
[
  { "date": "2026-03-01", "score": 3 },
  { "date": "2026-03-02", "score": 0 },
  { "date": "2026-03-03", "score": 5 }
]
7. Friends – Request mẫu
7.1 Gửi lời mời: POST /api/friends/requests/{userId}
text
POST /api/friends/requests/45f2...
Authorization: Bearer <access-token>
Response:

json
{
  "id": "fr-req-01",
  "fromUserId": "me-001",
  "toUserId": "45f2...",
  "status": "Pending",
  "createdAt": "2026-03-18T07:15:00Z"
}
8. Media – Upload avatar/bằng chứng
8.1 Lấy signed URL: POST /api/media/sign-upload
json
POST /api/media/sign-upload
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "fileName": "avatar.png",
  "contentType": "image/png"
}
Response:

json
{
  "uploadUrl": "https://storage.routin.app/upload/signed-url...",
  "publicUrl": "https://storage.routin.app/public/avatar-123.png",
  "expiresIn": 600
}
Sau đó frontend upload file trực tiếp lên uploadUrl, rồi lưu publicUrl vào profile hoặc evidence.
​

Nếu bạn muốn bước tiếp theo, mình có thể:

Viết thêm chi tiết cho Friends, Chats, Subscriptions theo đúng format trên.

Hoặc gom tất cả thành một file API_SPEC.md hoàn chỉnh để bạn dùng cho team.

viết thêm chi tiết cho tất cả các luồng api vô 1 file .md hãy viết đầy đủ
Completed 1 step
Dưới đây là file tài liệu ROUTIN_API_SPEC.md mô tả đầy đủ các luồng chính, gom theo feature, với mục đích + request/response mẫu (giả lập dựa trên Swagger). Bạn có thể copy nguyên khối.

text
# Routin API Specification

API quản lý thói quen hằng ngày – Social Habit Tracker.[page:1]

Base URL (prod): `https://routin.onrender.com`[page:1]

---

## 1. Auth – Xác thực & phiên đăng nhập

### 1.1 Đăng nhập bằng email/mật khẩu

**Endpoint**

`POST /api/Auth/login` – Đăng nhập bằng email và mật khẩu.[page:1]

**Use case**

- Màn hình: “Đăng nhập”.
- Sau khi login thành công, lưu `accessToken` và `refreshToken` để dùng cho các API khác.

**Request**

```json
POST /api/Auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}
Response 200

json
{
  "user": {
    "id": "c3f5bbde-9c1e-4d7a-9e73-1f21a3a5f001",
    "email": "user@example.com",
    "displayName": "Nguyễn Hoàng Phúc",
    "avatarUrl": "https://cdn.routin.app/avatars/123.png"
  },
  "accessToken": "<jwt-access-token>",
  "refreshToken": "<refresh-token>",
  "expiresIn": 3600
}
1.2 Đăng ký tài khoản (không OTP)
Endpoint

POST /api/Auth/register – Đăng ký tài khoản mới (không xác thực email).[page:1]

Use case

Môi trường dev/test, hoặc lúc bạn muốn flow đăng ký nhanh.

Request

json
POST /api/Auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "P@ssw0rd!",
  "displayName": "Nguyễn Hoàng Phúc"
}
Response 201

json
{
  "user": {
    "id": "c3f5bbde-9c1e-4d7a-9e73-1f21a3a5f001",
    "email": "user@example.com",
    "displayName": "Nguyễn Hoàng Phúc"
  },
  "accessToken": "<jwt-access-token>",
  "refreshToken": "<refresh-token>"
}
1.3 Flow đăng ký bằng OTP
1.3.1 Gửi OTP
Endpoint

POST /api/Auth/register/otp/send – Gửi mã OTP xác thực email.[page:1]

Request

json
POST /api/Auth/register/otp/send
Content-Type: application/json

{
  "email": "user@example.com"
}
Response 200

json
{
  "message": "OTP has been sent to your email."
}
1.3.2 Gửi lại OTP
Endpoint

POST /api/Auth/register/otp/resend – Gửi lại mã OTP.[page:1]

json
POST /api/Auth/register/otp/resend
Content-Type: application/json

{
  "email": "user@example.com"
}
1.3.3 Xác thực OTP & hoàn tất đăng ký
Endpoint

POST /api/Auth/register/otp/verify – Xác thực OTP và hoàn tất đăng ký.[page:1]

Request

json
POST /api/Auth/register/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "password": "P@ssw0rd!",
  "displayName": "Nguyễn Hoàng Phúc"
}
Response 201

json
{
  "user": {
    "id": "c3f5bbde-9c1e-4d7a-9e73-1f21a3a5f001",
    "email": "user@example.com",
    "displayName": "Nguyễn Hoàng Phúc"
  },
  "accessToken": "<jwt-access-token>",
  "refreshToken": "<refresh-token>"
}
1.4 Đăng nhập / đăng ký bằng Google
Endpoint

POST /api/Auth/google – Đăng nhập hoặc đăng ký bằng Google.[page:1]

Use case

Frontend lấy id_token từ Google, gửi lên backend.

Request

json
POST /api/Auth/google
Content-Type: application/json

{
  "idToken": "<google-id-token>"
}
Response 200

json
{
  "user": {
    "id": "c3f5bbde-9c1e-4d7a-9e73-1f21a3a5f001",
    "email": "user@example.com",
    "displayName": "Nguyễn Hoàng Phúc",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  },
  "accessToken": "<jwt-access-token>",
  "refreshToken": "<refresh-token>"
}
1.5 Làm mới access token
Endpoint

POST /api/Auth/refresh-token – Làm mới access token.[page:1]

Request

json
POST /api/Auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<refresh-token>"
}
Response

json
{
  "accessToken": "<new-access-token>",
  "refreshToken": "<new-refresh-token>",
  "expiresIn": 3600
}
1.6 Đăng xuất
Endpoint

POST /api/Auth/logout – Đăng xuất và thu hồi refresh token hiện tại.[page:1]

json
POST /api/Auth/logout
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refreshToken": "<refresh-token>"
}
Response

json
{
  "success": true
}
2. Users – Hồ sơ, follow, block
2.1 Lấy danh sách user (admin / explore)
GET /api/Users – Lấy danh sách tất cả người dùng.[page:1]

text
GET /api/Users
Authorization: Bearer <access-token>
2.2 Tạo user (Admin)
POST /api/Users – Tạo mới một người dùng (Dành cho Admin).[page:1]

json
POST /api/Users
Authorization: Bearer <admin-access-token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "P@ssw0rd!",
  "displayName": "New User"
}
2.3 Lấy profile của chính mình
GET /api/Users/me.[page:1]

text
GET /api/Users/me
Authorization: Bearer <access-token>
Response

json
{
  "id": "me-001",
  "email": "user@example.com",
  "displayName": "Nguyễn Hoàng Phúc",
  "avatarUrl": "https://cdn.routin.app/avatars/me-001.png",
  "bio": "Yêu chạy bộ.",
  "createdAt": "2026-03-01T10:00:00Z"
}
2.4 Cập nhật profile
PATCH /api/Users/me.[page:1]

json
PATCH /api/Users/me
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "displayName": "Phúc Nguyễn",
  "avatarUrl": "https://cdn.routin.app/avatars/new.png",
  "bio": "Fullstack dev, thích tạo habit mới."
}
2.5 Đổi mật khẩu
PATCH /api/Users/me/password.[page:1]

json
PATCH /api/Users/me/password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "oldPassword": "P@ssw0rd!",
  "newPassword": "N3wP@ssw0rd!!"
}
2.6 Lấy profile người khác
GET /api/Users/{id} – Lấy thông tin chi tiết người dùng theo ID.[page:1]

2.7 Follow / Unfollow
Follow

POST /api/Users/{id}/follow.[page:1]

text
POST /api/Users/45f2.../follow
Authorization: Bearer <access-token>
Unfollow

DELETE /api/Users/{id}/follow.[page:1]

text
DELETE /api/Users/45f2.../follow
Authorization: Bearer <access-token>
2.8 Followers / Following
GET /api/Users/{id}/followers – Danh sách người theo dõi user.[page:1]

GET /api/Users/{id}/following – Danh sách user mà user đang follow.[page:1]

2.9 Block / Unblock
POST /api/Users/{id}/block – Chặn người dùng.[page:1]

DELETE /api/Users/{id}/block – Bỏ chặn.[page:1]

GET /api/Users/me/blocks – Danh sách người bị chặn.[page:1]

3. Categories – Danh mục thói quen
3.1 CRUD thường
GET /api/Categories – Lấy danh sách tất cả danh mục.[page:1]

POST /api/Categories – Tạo mới một danh mục.[page:1]

GET /api/Categories/{id} – Lấy thông tin chi tiết danh mục.[page:1]

PUT/PATCH /api/Categories/{id} – Cập nhật danh mục.[page:1]

DELETE /api/Categories/{id} – Xóa danh mục.[page:1]

Ví dụ tạo category

json
POST /api/Categories
Authorization: Bearer <admin-access-token>
Content-Type: application/json

{
  "name": "Sức khỏe",
  "description": "Các thói quen liên quan đến sức khỏe"
}
3.2 Admin Categories
POST /api/admin/categories – Tạo (admin).[page:1]

GET /api/admin/categories – List (admin).[page:1]

GET /api/admin/categories/{id} – Chi tiết.[page:1]

PATCH /api/admin/categories/{id} – Cập nhật.[page:1]

DELETE /api/admin/categories/{id} – Xóa.[page:1]

4. Routines – Thói quen, Task, Prepare Items
4.1 Routines – người dùng hiện tại
GET /api/Routines/me – Get all my routines.[page:1]

GET /api/Routines/today – Routines hôm nay + trạng thái tiến độ.[page:1]

4.2 Tạo routine
POST /api/Routines – Create a new routine.[page:1]

json
POST /api/Routines
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Morning Routine",
  "description": "Chuỗi việc làm mỗi sáng",
  "repeatType": "Daily",
  "daysOfWeek": null,
  "remindAt": "06:30",
  "visibility": "Private",
  "categoryId": "9a21..."
}
4.3 Lấy / cập nhật / xóa routine
GET /api/Routines/{id} – Get routine by ID (with tasks).[page:1]

PUT /api/Routines/{id} – Update a routine.[page:1]

DELETE /api/Routines/{id} – Delete (soft delete).[page:1]

4.4 Copy routine public
POST /api/Routines/{id}/copy – Copy a public routine.[page:1]

Use case: lấy template routine của người khác về tài khoản mình.

4.5 Tasks trong routine
POST /api/Routines/{routineId}/tasks – Add a task to a routine.[page:1]

PUT /api/Routines/{routineId}/tasks/{taskId} – Update a task.[page:1]

DELETE /api/Routines/{routineId}/tasks/{taskId} – Delete a task.[page:1]

PUT /api/Routines/{routineId}/tasks/reorder – Reorder tasks in a routine.[page:1]

Ví dụ tạo task

json
POST /api/Routines/rtn-001/tasks
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Uống 2 lít nước",
  "type": "Quantity",
  "targetValue": 2000,
  "unit": "ml",
  "order": 1
}
4.6 Prepare Items
4.6.1 Cấp task
POST /api/Routines/{routineId}/tasks/{taskId}/prepare-items – Add.[page:1]

PUT /api/Routines/{routineId}/tasks/{taskId}/prepare-items/{itemId} – Update.[page:1]

DELETE /api/Routines/{routineId}/tasks/{taskId}/prepare-items/{itemId} – Soft delete.[page:1]

4.6.2 Cấp routine
POST /api/Routines/{routineId}/prepare-items – Add routine-level prepare item.[page:1]

PUT /api/Routines/{routineId}/prepare-items/{itemId} – Update.[page:1]

DELETE /api/Routines/{routineId}/prepare-items/{itemId} – Soft delete.[page:1]

5. TaskLogs – Check-in & log
GET /api/TaskLogs/today – Get all task logs for today.[page:1]

POST /api/TaskLogs/checkin – Check-in checkbox task (toggle complete/incomplete).[page:1]

POST /api/TaskLogs/log – Log quantity value cho task.[page:1]

POST /api/TaskLogs/{id}/skip – Skip a task log.[page:1]

PATCH /api/TaskLogs/{id}/evidence – Attach evidence URL.[page:1]

DELETE /api/TaskLogs/{id} – Undo check-in (delete today’s log).[page:1]

Ví dụ check-in

json
POST /api/TaskLogs/checkin
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "taskId": "task-02",
  "date": "2026-03-18"
}
6. Analytics – Thống kê
GET /api/analytics/me/overview – Tổng quan.[page:1]

GET /api/analytics/me/streaks – Streaks.[page:1]

GET /api/analytics/me/heatmap – Heatmap.[page:1]

GET /api/analytics/me/routines – Thống kê theo routine.[page:1]

GET /api/analytics/me/routines/{id} – Thống kê routine cụ thể.[page:1]

GET /api/analytics/me/tasks – Thống kê theo task.[page:1]

GET /api/analytics/me/progress-chart – Dữ liệu vẽ biểu đồ tiến độ.[page:1]

Example overview

text
GET /api/analytics/me/overview
Authorization: Bearer <access-token>
7. Friends – Kết bạn hai chiều
POST /api/friends/requests/{userId} – Gửi lời mời kết bạn.[page:1]

GET /api/friends/requests/incoming – Lời mời nhận.[page:1]

GET /api/friends/requests/outgoing – Lời mời đã gửi.[page:1]

POST /api/friends/requests/{id}/accept – Chấp nhận.[page:1]

POST /api/friends/requests/{id}/reject – Từ chối.[page:1]

DELETE /api/friends/requests/{id} – Hủy lời mời.[page:1]

GET /api/friends – Danh sách bạn bè.[page:1]

DELETE /api/friends/{userId} – Hủy kết bạn.[page:1]

8. Chats – Nhắn tin
POST /api/chats/direct/{userId} – Tạo conversation 1–1.[page:1]

GET /api/chats/conversations – Danh sách conversation.[page:1]

GET /api/chats/conversations/{id}/messages – Danh sách message.[page:1]

POST /api/chats/conversations/{id}/messages – Gửi tin nhắn.[page:1]

PATCH /api/chats/conversations/{id}/read – Đánh dấu đã đọc.[page:1]

DELETE /api/chats/messages/{id} – Xóa tin nhắn.[page:1]

9. Subscriptions & Payments
9.1 Subscription Plans (Admin)
GET /api/subscription-plans – List plans.[page:1]

POST /api/subscription-plans – Tạo plan.[page:1]

GET /api/subscription-plans/{id} – Chi tiết.[page:1]

PATCH /api/subscription-plans/{id} – Cập nhật plan.[page:1]

DELETE /api/subscription-plans/{id} – Xóa plan.[page:1]

9.2 Subscriptions
POST /api/subscriptions/checkout/{planId} – Checkout 1 gói.[page:1]

POST /api/subscriptions – Tạo subscription (thường sau thanh toán).[page:1]

GET /api/subscriptions – List (admin).[page:1]

GET /api/subscriptions/me – Subscription hiện tại.[page:1]

POST /api/subscriptions/{id}/cancel – Hủy.[page:1]

POST /api/subscriptions/webhook/payos – Webhook từ PayOS.[page:1]

9.3 Payments
GET /api/payments/me – Lịch sử thanh toán của tôi.[page:1]

GET /api/payments – Tất cả payment (admin).[page:1]

10. Media – Upload file
POST /api/media/sign-upload – Lấy signed URL upload.[page:1]

json
POST /api/media/sign-upload
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "fileName": "avatar.png",
  "contentType": "image/png"
}
Response:

json
{
  "uploadUrl": "https://storage.routin.app/upload/signed-url...",
  "publicUrl": "https://storage.routin.app/public/avatar-123.png",
  "expiresIn": 600
}
11. Admin Users
GET /api/admin/users – List user (admin).[page:1]

POST /api/admin/users – Tạo user (admin).[page:1]

GET /api/admin/users/{id} – Chi tiết user (admin).[page:1]

12. Health & Root
GET /health – Health check.[page:1]

GET / – Root endpoint.[page:1]

