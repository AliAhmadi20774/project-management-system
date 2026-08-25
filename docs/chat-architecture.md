# Realtime chat: production checklist

## Implemented core

- [x] PostgreSQL is the durable source of truth for conversations and messages.
- [x] Cursor-based history loading (50 messages at a time), never the whole thread.
- [x] Idempotent sending with a client UUID, so reconnect/retry cannot duplicate a message.
- [x] WebSocket events for messages, typing indicators and read receipts.
- [x] Redis channel layer for cross-process broadcast; it is not used as message storage.
- [x] A one-minute, chat-only WebSocket ticket issued from the existing HTTP-only session.
- [x] Per-conversation authorization on REST and WebSocket operations.
- [x] Redis persistence and a bounded 256 MB local development policy.

## Before production

- [ ] Run ASGI workers (Daphne/Uvicorn) behind Nginx/Caddy with TLS and WebSocket upgrade support.
- [ ] Set `NEXT_PUBLIC_CHAT_WS_URL=wss://api.example.com/ws/chat/`; redact the `ticket` query parameter from proxy logs.
- [ ] Add origin validation, per-user connection/message rate limits and structured audit logs.
- [ ] Add observability: WebSocket connections, reconnects, message latency, Redis memory, PostgreSQL slow queries and failed sends.
- [ ] Add PostgreSQL backups plus point-in-time recovery; regularly test restores.
- [ ] Put attachments in object storage (S3-compatible), using direct multipart uploads, MIME/size checks, antivirus scanning and signed download URLs.
- [ ] Configure attachment quotas per user/workspace and lifecycle rules for thumbnails/originals.
- [ ] Define retention explicitly: soft-delete window, permanent purge job, legal hold and `VACUUM`/partition maintenance.
- [ ] Partition the message table by time once message volume justifies it; do not pre-partition prematurely.
- [ ] Add edit/delete, reactions, delivery/read semantics, group conversations and notification fan-out in separate migrations.

## Scaling rules

1. REST bootstraps and repairs state; WebSocket only carries live deltas.
2. Never broadcast history, attachments or presence snapshots through Redis groups.
3. Keep typing/presence ephemeral with a TTL; persist only the business records that need history.
4. Page by an indexed cursor (`conversation_id`, `id`) and hydrate only the active thread.
5. Use object storage and asynchronous workers for files, thumbnails, scanning and retention deletion.
