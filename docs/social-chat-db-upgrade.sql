START TRANSACTION;

DROP INDEX "IX_Follows_FollowingId";

CREATE TABLE "Conversations" (
    "Id" uuid NOT NULL,
    "Type" integer NOT NULL,
    "Title" character varying(150),
    "CreatedById" uuid,
    "LastMessageAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    CONSTRAINT "PK_Conversations" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Conversations_Users_CreatedById" FOREIGN KEY ("CreatedById") REFERENCES "Users" ("Id") ON DELETE SET NULL
);

CREATE TABLE "FriendRequests" (
    "Id" uuid NOT NULL,
    "RequesterId" uuid NOT NULL,
    "AddresseeId" uuid NOT NULL,
    "Status" integer NOT NULL,
    "RespondedAt" timestamp with time zone,
    "ExpiresAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    CONSTRAINT "PK_FriendRequests" PRIMARY KEY ("Id"),
    CONSTRAINT "CK_FriendRequests_NotSelf" CHECK ("RequesterId" <> "AddresseeId"),
    CONSTRAINT "FK_FriendRequests_Users_AddresseeId" FOREIGN KEY ("AddresseeId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_FriendRequests_Users_RequesterId" FOREIGN KEY ("RequesterId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "UserBlocks" (
    "BlockerId" uuid NOT NULL,
    "BlockedId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_UserBlocks" PRIMARY KEY ("BlockerId", "BlockedId"),
    CONSTRAINT "CK_UserBlocks_NotSelf" CHECK ("BlockerId" <> "BlockedId"),
    CONSTRAINT "FK_UserBlocks_Users_BlockedId" FOREIGN KEY ("BlockedId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_UserBlocks_Users_BlockerId" FOREIGN KEY ("BlockerId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Messages" (
    "Id" uuid NOT NULL,
    "ConversationId" uuid NOT NULL,
    "SenderId" uuid NOT NULL,
    "Type" integer NOT NULL,
    "Body" character varying(4000),
    "ReplyToMessageId" uuid,
    "ClientMessageId" character varying(100),
    "EditedAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    CONSTRAINT "PK_Messages" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Messages_Conversations_ConversationId" FOREIGN KEY ("ConversationId") REFERENCES "Conversations" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Messages_Messages_ReplyToMessageId" FOREIGN KEY ("ReplyToMessageId") REFERENCES "Messages" ("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Messages_Users_SenderId" FOREIGN KEY ("SenderId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Friendships" (
    "UserAId" uuid NOT NULL,
    "UserBId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "SourceRequestId" uuid,
    CONSTRAINT "PK_Friendships" PRIMARY KEY ("UserAId", "UserBId"),
    CONSTRAINT "CK_Friendships_OrderedPair" CHECK ("UserAId" < "UserBId"),
    CONSTRAINT "FK_Friendships_FriendRequests_SourceRequestId" FOREIGN KEY ("SourceRequestId") REFERENCES "FriendRequests" ("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Friendships_Users_UserAId" FOREIGN KEY ("UserAId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Friendships_Users_UserBId" FOREIGN KEY ("UserBId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "ConversationParticipants" (
    "ConversationId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Role" integer NOT NULL,
    "JoinedAt" timestamp with time zone NOT NULL,
    "LeftAt" timestamp with time zone,
    "IsMuted" boolean NOT NULL,
    "LastReadMessageId" uuid,
    CONSTRAINT "PK_ConversationParticipants" PRIMARY KEY ("ConversationId", "UserId"),
    CONSTRAINT "FK_ConversationParticipants_Conversations_ConversationId" FOREIGN KEY ("ConversationId") REFERENCES "Conversations" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_ConversationParticipants_Messages_LastReadMessageId" FOREIGN KEY ("LastReadMessageId") REFERENCES "Messages" ("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_ConversationParticipants_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "MessageAttachments" (
    "Id" uuid NOT NULL,
    "MessageId" uuid NOT NULL,
    "MediaUrl" character varying(1000) NOT NULL,
    "MediaType" character varying(50) NOT NULL,
    "SizeBytes" bigint,
    "MetadataJson" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    CONSTRAINT "PK_MessageAttachments" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_MessageAttachments_Messages_MessageId" FOREIGN KEY ("MessageId") REFERENCES "Messages" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_Follows_FollowerId_CreatedAt" ON "Follows" ("FollowerId", "CreatedAt");

CREATE INDEX "IX_Follows_FollowingId_CreatedAt" ON "Follows" ("FollowingId", "CreatedAt");

CREATE INDEX "IX_ConversationParticipants_LastReadMessageId" ON "ConversationParticipants" ("LastReadMessageId");

CREATE INDEX "IX_ConversationParticipants_UserId_ConversationId" ON "ConversationParticipants" ("UserId", "ConversationId");

CREATE INDEX "IX_Conversations_CreatedById" ON "Conversations" ("CreatedById");

CREATE INDEX "IX_Conversations_LastMessageAt" ON "Conversations" ("LastMessageAt");

CREATE INDEX "IX_FriendRequests_AddresseeId_Status_CreatedAt" ON "FriendRequests" ("AddresseeId", "Status", "CreatedAt");

CREATE INDEX "IX_FriendRequests_RequesterId_AddresseeId_Status" ON "FriendRequests" ("RequesterId", "AddresseeId", "Status");

CREATE INDEX "IX_Friendships_CreatedAt" ON "Friendships" ("CreatedAt");

CREATE INDEX "IX_Friendships_SourceRequestId" ON "Friendships" ("SourceRequestId");

CREATE INDEX "IX_Friendships_UserBId" ON "Friendships" ("UserBId");

CREATE INDEX "IX_MessageAttachments_MessageId" ON "MessageAttachments" ("MessageId");

CREATE UNIQUE INDEX "IX_Messages_ConversationId_ClientMessageId" ON "Messages" ("ConversationId", "ClientMessageId") WHERE "ClientMessageId" IS NOT NULL;

CREATE INDEX "IX_Messages_ConversationId_CreatedAt" ON "Messages" ("ConversationId", "CreatedAt");

CREATE INDEX "IX_Messages_ReplyToMessageId" ON "Messages" ("ReplyToMessageId");

CREATE INDEX "IX_Messages_SenderId_CreatedAt" ON "Messages" ("SenderId", "CreatedAt");

CREATE INDEX "IX_UserBlocks_BlockedId" ON "UserBlocks" ("BlockedId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260316062134_AddSocialFriendChatSchema', '8.0.11');

COMMIT;

