Routin API v1 – Internal Spec
API quản lý thói quen hàng ngày – Social Habit Tracker.
​
Tất cả endpoint (trừ health, root) yêu cầu JWT Bearer từ Auth service.
​

Auth
POST /api/Auth/login
Đăng nhập bằng email và mật khẩu.
​

Body: LoginDto (email, password).

Response: accessToken, refreshToken, user info.

POST /api/Auth/register
Đăng ký tài khoản mới (chưa xác thực email).
​

Body: RegisterDto.

Flow tiếp: gửi OTP → verify OTP.

POST /api/Auth/register/otp/send
Gửi mã OTP xác thực email.
​

Body: SendOtpDto (chủ yếu là email).

POST /api/Auth/register/otp/verify
Xác thực OTP và hoàn tất đăng ký.
​

Body: VerifyOtpDto (email + otp).

Thường trả về token sau khi verify thành công.

POST /api/Auth/google
Đăng nhập hoặc đăng ký bằng Google.
​

Body: GoogleLoginDto (ID token từ FE).

Backend verify token với Google, tạo/tìm user.

POST /api/Auth/refresh-token
Làm mới access token.
​

Body: RefreshTokenDto.

Response: accessToken (và refreshToken) mới.

POST /api/Auth/logout
Đăng xuất và thu hồi refresh token hiện tại.
​

Users
GET /api/Users
Lấy danh sách tất cả người dùng (phục vụ admin/management).
​

POST /api/Users
Tạo mới một người dùng (dành cho Admin).
​

Body: CreateUserDto.

GET /api/Users/{id}
Lấy thông tin chi tiết người dùng theo ID.
​

GET /api/Users/me
Lấy thông tin profile của chính mình.
​

PATCH /api/Users/me
Cập nhật profile của chính mình.
​

Body: UpdateProfileDto.

PATCH /api/Users/me/password
Đổi mật khẩu.
​

Body: ChangePasswordDto.

POST /api/Users/{id}/follow
Follow một user.
​

DELETE /api/Users/{id}/follow
Unfollow user.
​

GET /api/Users/{id}/followers
Danh sách follower của user.
​

GET /api/Users/{id}/following
Danh sách user mà user này đang follow.
​

POST /api/Users/{id}/block
Block user.
​

DELETE /api/Users/{id}/block
Unblock user.
​

GET /api/Users/me/blocks
Danh sách user mình đã block.
​

Admin – Categories
POST /api/admin/categories
Tạo category mới (admin).
​

Body: CreateCategoryDto.

GET /api/admin/categories
Danh sách category cho admin.
​

GET /api/admin/categories/{id}
Chi tiết một category cho admin.
​

PATCH /api/admin/categories/{id}
Cập nhật category (admin).
​

Body: UpdateCategoryDto.

DELETE /api/admin/categories/{id}
Xóa category (admin, thường soft delete).
​

Admin – Users
GET /api/admin/users
Danh sách user trong admin panel.
​

POST /api/admin/users
Admin tạo user mới.
​

Body: CreateUserDto.

GET /api/admin/users/{id}
Xem chi tiết 1 user trong admin panel.
​

Categories (Public)
GET /api/Categories
Lấy danh sách tất cả danh mục (client dùng để filter/gợi ý).
​

POST /api/Categories
Tạo danh mục (thường dành cho admin/editor).
​

GET /api/Categories/{id}
Lấy thông tin chi tiết một danh mục theo ID.
​

PUT /api/Categories/{id} / PATCH /api/Categories/{id}
Cập nhật thông tin danh mục.
​

Body: UpdateCategoryDto.

DELETE /api/Categories/{id}
Xóa một danh mục (soft delete).
​

Routines
GET /api/Routines/me
Get all my routines.
​

GET /api/Routines/today
Get today’s routines with progress status.
​

GET /api/Routines/{id}
Get routine by ID (with tasks).
​

POST /api/Routines
Create a new routine.
​

Body: CreateRoutineDto.

PUT /api/Routines/{id}
Update a routine.
​

Body: UpdateRoutineDto.

DELETE /api/Routines/{id}
Delete a routine (soft delete).
​

POST /api/Routines/{id}/copy
Copy a public routine (clone về account hiện tại).
​

Tasks in Routine
POST /api/Routines/{routineId}/tasks
Add a task to a routine.
​

Body: CreateRoutineTaskDto.

PUT /api/Routines/{routineId}/tasks/{taskId}
Update a task in a routine.
​

Body: UpdateRoutineTaskDto.

DELETE /api/Routines/{routineId}/tasks/{taskId}
Delete a task from a routine.
​

PUT /api/Routines/{routineId}/tasks/reorder
Reorder tasks in a routine.
​

Body: ReorderTasksDto.

Prepare Items – Task level
POST /api/Routines/{routineId}/tasks/{taskId}/prepare-items
Add a prepare item to a specific task.
​

Body: CreatePrepareItemDto.

PUT /api/Routines/{routineId}/tasks/{taskId}/prepare-items/{itemId}
Update a prepare item of a specific task.
​

DELETE /api/Routines/{routineId}/tasks/{taskId}/prepare-items/{itemId}
Delete a prepare item from a specific task (soft delete).
​

Prepare Items – Routine level
POST /api/Routines/{routineId}/prepare-items
Add a routine-level prepare item (shared across all tasks).
​

PUT /api/Routines/{routineId}/prepare-items/{itemId}
Update a routine-level prepare item.
​

DELETE /api/Routines/{routineId}/prepare-items/{itemId}
Delete a routine-level prepare item (soft delete).
​

TaskLogs
GET /api/TaskLogs/today
Get all task logs for today.
​

POST /api/TaskLogs/checkin
Check-in a checkbox task (toggle complete/incomplete).
​

Body: CheckInDto.

POST /api/TaskLogs/log
Log a quantity value for a task.
​

Body: LogQuantityDto.

POST /api/TaskLogs/{id}/skip
Skip a task log.
​

PATCH /api/TaskLogs/{id}/evidence
Attach evidence URL to a task log.
​

Body: UpdateTaskLogEvidenceDto.

DELETE /api/TaskLogs/{id}
Undo a check-in (delete today’s log).
​

Analytics
GET /api/analytics/me/overview
Tổng quan analytics của user (completion rate, total routines,…).
​

GET /api/analytics/me/streaks
Thông tin streaks (current streak, best streak,…).
​

GET /api/analytics/me/heatmap
Dữ liệu heatmap theo ngày.
​

GET /api/analytics/me/routines
Analytics theo từng routine.
​

GET /api/analytics/me/routines/{id}
Analytics chi tiết cho một routine.
​

GET /api/analytics/me/tasks
Analytics theo task.
​

GET /api/analytics/me/progress-chart
Dữ liệu vẽ biểu đồ progress chart.
​

Friends
POST /api/friends/requests/{userId}
Gửi yêu cầu kết bạn tới userId.
​

GET /api/friends/requests/incoming
Danh sách lời mời kết bạn đến mình.
​

GET /api/friends/requests/outgoing
Danh sách lời mời kết bạn mình đã gửi.
​

POST /api/friends/requests/{id}/accept
Chấp nhận lời mời kết bạn.
​

POST /api/friends/requests/{id}/reject
Từ chối lời mời kết bạn.
​

DELETE /api/friends/requests/{id}
Hủy yêu cầu kết bạn.
​

GET /api/friends
Danh sách bạn bè hiện tại.
​

DELETE /api/friends/{userId}
Unfriend userId.
​

Chats
POST /api/chats/direct/{userId}
Tạo/hoặc lấy direct conversation với userId.
​

GET /api/chats/conversations
Danh sách conversation của user.
​

GET /api/chats/conversations/{id}/messages
Danh sách message trong conversation id.
​

POST /api/chats/conversations/{id}/messages
Gửi message mới trong conversation.
​

Body: SendMessageDto.

PATCH /api/chats/conversations/{id}/read
Đánh dấu conversation đã đọc.
​

Body: MarkConversationReadDto.

DELETE /api/chats/messages/{id}
Xóa message.
​

Subscriptions & Payments
GET /api/subscription-plans
Danh sách tất cả subscription plans.
​

POST /api/subscription-plans
Tạo subscription plan mới.
​

Body: CreateSubscriptionPlanDto.

GET /api/subscription-plans/{id}
Chi tiết 1 subscription plan.
​

PATCH /api/subscription-plans/{id}
Cập nhật subscription plan.
​

Body: UpdateSubscriptionPlanDto.

DELETE /api/subscription-plans/{id}
Xóa subscription plan.
​

POST /api/subscriptions/checkout/{planId}
Tạo checkout session cho planId (PayOS).
​

POST /api/subscriptions
Tạo subscription (thường cho admin hoặc từ webhook).
​

Body: CreateSubscriptionRequestDto.

GET /api/subscriptions
Danh sách tất cả subscriptions (admin).
​

GET /api/subscriptions/me
Subscription hiện tại của user.
​

POST /api/subscriptions/{id}/cancel
Cancel subscription (không gia hạn nữa).
​

POST /api/subscriptions/webhook/payos
Webhook nhận sự kiện từ PayOS.
​

Body: PayOsWebhookData + PayOsWebhookType.

Payments
GET /api/payments/me
Lịch sử thanh toán của user hiện tại.
​

GET /api/payments
Tất cả payments (admin).
​

Media
POST /api/media/sign-upload
Tạo signed upload URL cho media (S3/GCS,…).
​

Body: SignUploadRequestDto.

System
GET /health
Health check.
​

GET /
Root endpoint (chung cho service).
​

Tổng quan: API của bạn chia thành các module rõ ràng: Auth, Users, Routines, TaskLogs, Analytics, Friends, Chats, Media, Subscriptions/Payments, Categories, Admin. Dưới đây là giải thích chi tiết theo từng nhóm, ở mức “business flow” để bạn có thể map sang FE/mobile.
​

1. Admin: Categories & Users
   AdminCategories – quản lý danh mục ở khu vực admin.
   ​

POST /api/admin/categories: Tạo category mới (dành cho admin).

GET /api/admin/categories: Lấy danh sách categories cho admin (có thể kèm filter, paging).

GET /api/admin/categories/{id}: Lấy chi tiết 1 category.

PATCH /api/admin/categories/{id}: Cập nhật một phần thông tin category.

DELETE /api/admin/categories/{id}: Xóa (thường là soft delete) category.

AdminUsers – quản lý user ở panel admin.
​

GET /api/admin/users: Lấy danh sách user (filter theo email, role, active, v.v.).

POST /api/admin/users: Admin tạo user thủ công (ví dụ tạo tài khoản internal).

GET /api/admin/users/{id}: Xem chi tiết 1 user (profile, trạng thái, roles).

Tất cả các API admin cần token của user có quyền admin (role-based).
​

2. Auth: đăng ký, đăng nhập, Google, token
   Đăng nhập / Đăng ký / OTP / Token.
   ​

POST /api/Auth/login: Login bằng email + mật khẩu (body LoginDto), trả về access + refresh token.

POST /api/Auth/register: Đăng ký tài khoản mới bằng email/password, chưa xác thực email.

POST /api/Auth/register/otp/send: Gửi OTP tới email cho user mới đăng ký.

POST /api/Auth/register/otp/verify: User gửi lại OTP, xác thực email và hoàn tất đăng ký, thường trả token.

POST /api/Auth/google: FE gửi Google ID token (body GoogleLoginDto), BE verify, tạo/tìm user, trả JWT.

POST /api/Auth/refresh-token: Nhận RefreshTokenDto, trả về cặp token mới khi access token hết hạn.

POST /api/Auth/logout: Thu hồi refresh token hiện tại (revoke), logout người dùng.

Luồng sử dụng: FE đăng ký → gửi/verify OTP → login hoặc login Google → BE trả JWT → mọi API khác dùng header Authorization: Bearer <token>.
​

3. Users: profile, follow, block
   Nhóm Users phục vụ social layer (profile, follow, block).
   ​

GET /api/Users: Admin/hoặc user có quyền xem danh sách tất cả người dùng.

POST /api/Users: Admin tạo user (CreateUserDto).

GET /api/Users/{id}: Lấy info public chi tiết user theo id (tên, avatar, stats cơ bản).

GET /api/Users/me: Lấy profile chính mình (email, full info).

PATCH /api/Users/me: Update profile (UpdateProfileDto: tên, avatar, bio, v.v.).

PATCH /api/Users/me/password: Đổi password (ChangePasswordDto).

Follow / Unfollow / Block:
​

POST /api/Users/{id}/follow: Follow user có id này.

DELETE /api/Users/{id}/follow: Unfollow.

GET /api/Users/{id}/followers: Danh sách follower của user đó.

GET /api/Users/{id}/following: Danh sách người user đó đang follow.

POST /api/Users/{id}/block: Block user (ẩn nội dung, chặn chat, v.v.).

DELETE /api/Users/{id}/block: Unblock.

GET /api/Users/me/blocks: Xem list những user mình đã block.

Những API này cần JWT, dùng cho social graph (ai theo dõi ai, ai bị chặn).
​

4. Categories: danh mục thói quen
   Nhóm Categories là danh mục nội dung (ví dụ: health, study, work, etc.).
   ​

GET /api/Categories: Lấy danh sách tất cả categories cho client (public).

POST /api/Categories: Tạo category mới (CreateCategoryDto) – thường dành cho admin/editor.

GET /api/Categories/{id}: Lấy chi tiết một category.

PUT /api/Categories/{id} / PATCH /api/Categories/{id}: Cập nhật category.

DELETE /api/Categories/{id}: Xóa category (thường soft delete).

Categories sẽ liên kết với routines/tasks để gợi ý theo chủ đề.
​

5. Routines: routine, task, prepare items
   Đây là core tracking logic: routine (thói quen) chứa nhiều task, kèm “prepare items”.
   ​

Routine CRUD & view:

GET /api/Routines/me: Lấy toàn bộ routine của user hiện tại (kèm tasks).

GET /api/Routines/today: Lấy routines hôm nay kèm trạng thái hoàn thành (dùng trong màn hình hôm nay).

GET /api/Routines/{id}: Lấy chi tiết 1 routine (tasks, schedule, prepare items).

POST /api/Routines: Tạo routine mới (CreateRoutineDto: tên, visibility, repeat type, difficulty,…).

PUT /api/Routines/{id}: Update routine (UpdateRoutineDto).

DELETE /api/Routines/{id}: Xóa routine (soft delete – giữ lịch sử).

Copy routine public:

POST /api/Routines/{id}/copy: Copy một routine public của người khác thành routine của mình (clone tasks, schedule, v.v.).
​

Tasks trong routine:

POST /api/Routines/{routineId}/tasks: Thêm task vào routine (CreateRoutineTaskDto: tên task, type, unit, target…).

PUT /api/Routines/{routineId}/tasks/{taskId}: Update 1 task (UpdateRoutineTaskDto).

DELETE /api/Routines/{routineId}/tasks/{taskId}: Xóa task khỏi routine (soft delete).

PUT /api/Routines/{routineId}/tasks/reorder: Reorder danh sách tasks (ReorderTasksDto: danh sách taskId + thứ tự).

Prepare items (đồ chuẩn bị)

Task-level:

POST /api/Routines/{routineId}/tasks/{taskId}/prepare-items: Thêm item chuẩn bị riêng cho task (CreatePrepareItemDto).

PUT /api/Routines/{routineId}/tasks/{taskId}/prepare-items/{itemId}: Cập nhật item.

DELETE /api/Routines/{routineId}/tasks/{taskId}/prepare-items/{itemId}: Xóa (soft).

Routine-level (dùng chung cho mọi task trong routine):

POST /api/Routines/{routineId}/prepare-items

PUT /api/Routines/{routineId}/prepare-items/{itemId}

DELETE /api/Routines/{routineId}/prepare-items/{itemId}

Nhờ các endpoint này bạn build được flow: tạo routine → thêm tasks → sắp xếp thứ tự → thêm checklist chuẩn bị cho từng task hoặc routine.
​

6. TaskLogs: check-in, log số lượng, skip, evidence
   TaskLogs là lịch sử thực hiện từng task mỗi ngày.
   ​

GET /api/TaskLogs/today: Lấy toàn bộ task logs cho hôm nay (cho cả routine/tasks của ngày).

POST /api/TaskLogs/checkin: Check-in 1 task “kiểu checkbox” (Complete/Incomplete) – body CheckInDto (chứa taskId, ngày, routineId, v.v.).

POST /api/TaskLogs/log: Log giá trị số lượng cho task kiểu quantity (LogQuantityDto: taskId, value,…).

POST /api/TaskLogs/{id}/skip: Đánh dấu bỏ qua (skip) log này (ví dụ “hôm nay cho pass”).

PATCH /api/TaskLogs/{id}/evidence: Gắn evidence URL (ảnh, link video) cho một log (UpdateTaskLogEvidenceDto).

DELETE /api/TaskLogs/{id}: Undo check-in (xóa log hôm nay), dùng khi user check nhầm.

Những log này là nguồn dữ liệu cho Analytics (streaks, heatmap, progress).
​

7. Analytics: thống kê & biểu đồ
   Nhóm Analytics cho user hiện tại.
   ​

GET /api/analytics/me/overview: Tổng quan (tổng số routine, completion rate, số ngày active, v.v.).

GET /api/analytics/me/streaks: Chuỗi ngày liên tiếp hoàn thành (streak, best streak, current streak).

GET /api/analytics/me/heatmap: Dữ liệu heatmap theo ngày (giống GitHub contribution).

GET /api/analytics/me/routines: Thống kê theo từng routine (số ngày hoàn thành, tỉ lệ hoàn thành).

GET /api/analytics/me/routines/{id}: Chi tiết analytics cho 1 routine.

GET /api/analytics/me/tasks: Analytics trên từng task.

GET /api/analytics/me/progress-chart: Dữ liệu vẽ biểu đồ progress theo thời gian.

FE dùng các endpoint này để render dashboard cho người dùng.
​

8. Friends & Chats: mạng xã hội + nhắn tin
   Friends – flow kết bạn:
   ​

POST /api/friends/requests/{userId}: Gửi lời mời kết bạn tới userId.

GET /api/friends/requests/incoming: List lời mời đến mình.

GET /api/friends/requests/outgoing: List lời mời mình đã gửi.

POST /api/friends/requests/{id}/accept: Accept lời mời.

POST /api/friends/requests/{id}/reject: Từ chối.

DELETE /api/friends/requests/{id}: Hủy lời mời (gửi đi hoặc đến).

GET /api/friends: Danh sách bạn bè hiện tại.

DELETE /api/friends/{userId}: Unfriend userId.

Chats – nhắn tin giữa bạn bè:
​

POST /api/chats/direct/{userId}: Mở/tạo direct conversation với userId (nếu chưa có thì tạo mới).

GET /api/chats/conversations: Lấy danh sách conversation (id, lastMessage, unreadCount).

GET /api/chats/conversations/{id}/messages: Lấy message history của conversation id.

POST /api/chats/conversations/{id}/messages: Gửi message mới (SendMessageDto).

PATCH /api/chats/conversations/{id}/read: Đánh dấu conversation đã đọc (MarkConversationReadDto).

DELETE /api/chats/messages/{id}: Xóa message cụ thể (soft delete hoặc hide).

Nhờ đó bạn build được UI giống Messenger/DM dựa trên graph bạn bè.
​

9. Subscriptions & Payments: gói, checkout, PayOS
   SubscriptionPlans – quản lý gói (free, pro,…).
   ​

GET /api/subscription-plans: Lấy list các gói hiện có (cho FE hiển thị pricing).

POST /api/subscription-plans: Tạo gói mới (CreateSubscriptionPlanDto).

GET /api/subscription-plans/{id}: Lấy chi tiết 1 gói.

PATCH /api/subscription-plans/{id}: Cập nhật gói.

DELETE /api/subscription-plans/{id}: Xóa gói.

Subscriptions – đăng ký gói cho user.
​

POST /api/subscriptions/checkout/{planId}: Tạo checkout session với PayOS/PG, trả link thanh toán.

POST /api/subscriptions: Tạo subscription thủ công (CreateSubscriptionRequestDto) – có thể dùng bởi admin hoặc hệ thống.

GET /api/subscriptions: Lấy tất cả subscriptions (admin view).

GET /api/subscriptions/me: Xem subscription hiện tại của user (gói gì, expiry, trạng thái).

POST /api/subscriptions/{id}/cancel: Cancel subscription (không renew nữa).

POST /api/subscriptions/webhook/payos: Webhook PayOS – PayOS gọi endpoint này khi thanh toán thành công/hủy/failed; server update trạng thái subscription & payment.

Payments – lịch sử thanh toán.
​

GET /api/payments/me: Lịch sử thanh toán của mình.

GET /api/payments: Tất cả payments (admin).

Flow: user chọn gói → FE gọi /subscriptions/checkout/{planId} → redirect tới PayOS → PayOS callback /subscriptions/webhook/payos → server tạo/active subscription + payment record.
​

10. Media & Misc: upload, health
    Media – hỗ trợ upload media (sử dụng signed URL).
    ​

POST /api/media/sign-upload: Nhận SignUploadRequestDto (filename, contentType, v.v.) → backend trả URL ký (ví dụ S3/Cloud storage) để FE upload trực tiếp.

Flow: FE gọi sign-upload → nhận signed URL → upload file → lưu URL vào evidence/task/user avatar.
​

Routin.API – health & root.
​

GET /health: Health check (cho load balancer/monitoring).

GET /: Root endpoint, thường trả status hoặc redirect docs.

Nếu bạn muốn, ở bước tiếp theo tôi có thể:

Viết file markdown “API spec” tóm tắt theo format bạn dùng trong docs nội bộ,

Hoặc gợi ý cấu trúc FE (React/Flutter) mapping từng nhóm API thành service/module cụ thể.
