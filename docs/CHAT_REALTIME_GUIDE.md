# Chat Realtime Integration Guide (SignalR)

Tài liệu này hướng dẫn FE tích hợp realtime cho module chat đã implement ở backend.

## 1. Tổng quan

Backend hiện có 2 lớp:

- REST API để CRUD message/conversation.
- SignalR Hub để nhận sự kiện realtime.

Hub endpoint:

- `/hubs/chat`

JWT auth cho hub:

- Truyền token qua query string: `access_token`.
- Ví dụ: `/hubs/chat?access_token=<jwt_token>`

## 2. Realtime contracts

### 2.1 Client -> Hub methods

- `JoinConversation(conversationId)`
- `LeaveConversation(conversationId)`

### 2.2 Server -> Client events

- `chat:conversation-upsert`
- `chat:message-created`
- `chat:conversation-read`
- `chat:message-deleted`

## 3. Event payloads

### 3.1 `chat:conversation-upsert`

```json
{
  "conversationId": "guid",
  "type": "Direct",
  "title": null,
  "lastMessageAt": "2026-03-16T09:30:12.000Z"
}
```

### 3.2 `chat:message-created`

```json
{
  "messageId": "guid",
  "conversationId": "guid",
  "senderId": "guid",
  "type": "Text",
  "body": "hello",
  "clientMessageId": "optional-client-id",
  "createdAt": "2026-03-16T09:30:12.000Z"
}
```

### 3.3 `chat:conversation-read`

```json
{
  "conversationId": "guid",
  "readerUserId": "guid",
  "lastReadMessageId": "guid-or-null"
}
```

### 3.4 `chat:message-deleted`

```json
{
  "conversationId": "guid",
  "messageId": "guid",
  "deletedByUserId": "guid"
}
```

## 4. FE flow khuyến nghị

### 4.1 Khi mở màn hình chat list

1. Connect SignalR hub.
2. Subscribe events:
   - `chat:conversation-upsert`
   - `chat:message-created`
   - `chat:conversation-read`
   - `chat:message-deleted`
3. Gọi REST `GET /api/chats/conversations` để lấy snapshot ban đầu.
4. Khi nhận `chat:conversation-upsert`, merge vào list theo `conversationId`.

### 4.2 Khi mở 1 conversation detail

1. Gọi `JoinConversation(conversationId)`.
2. Gọi REST `GET /api/chats/conversations/{id}/messages` để lấy lịch sử.
3. Khi gửi tin:
   - gọi REST `POST /api/chats/conversations/{id}/messages`.
   - backend sẽ push `chat:message-created`.
4. Khi rời màn hình:
   - gọi `LeaveConversation(conversationId)`.

### 4.3 Read receipt

- FE gọi REST `PATCH /api/chats/conversations/{id}/read`.
- Backend sẽ push `chat:conversation-read`.

## 5. React sample

```ts
import * as signalR from "@microsoft/signalr";

export async function createChatConnection(baseUrl: string, token: string) {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/hubs/chat?access_token=${encodeURIComponent(token)}`)
    .withAutomaticReconnect()
    .build();

  connection.on("chat:message-created", (payload) => {
    console.log("new message", payload);
  });

  connection.on("chat:conversation-upsert", (payload) => {
    console.log("conversation upsert", payload);
  });

  connection.on("chat:conversation-read", (payload) => {
    console.log("read event", payload);
  });

  connection.on("chat:message-deleted", (payload) => {
    console.log("message deleted", payload);
  });

  await connection.start();
  return connection;
}
```

## 6. Flutter sample

Dùng package `signalr_netcore`.

```dart
final connection = HubConnectionBuilder()
    .withUrl(
      '$baseUrl/hubs/chat?access_token=$token',
      options: HttpConnectionOptions(logging: (level, message) => print(message)),
    )
    .withAutomaticReconnect()
    .build();

connection.on('chat:message-created', (args) {
  final payload = args?.first;
  print('new message: $payload');
});

await connection.start();
```

## 7. Best practices

- Luôn load snapshot qua REST trước, realtime chỉ để cập nhật delta.
- Không insert message local vĩnh viễn trước khi nhận response REST hoặc event realtime.
- Dùng `clientMessageId` để chống duplicate trên FE.
- Khi reconnect, nên reload conversation list + message window để đồng bộ.
- Nếu websocket lỗi, fallback polling REST mỗi 5-10 giây.

## 8. Quick test checklist

1. User A và B là bạn bè.
2. A mở conversation với B, B cũng mở conversation đó.
3. A gửi tin nhắn -> B nhận event `chat:message-created` ngay.
4. B đọc tin -> A nhận event `chat:conversation-read`.
5. A xóa tin nhắn của A -> B nhận event `chat:message-deleted`.
