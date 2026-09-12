BEGIN;

-- Keep stale-lock recovery and worker claiming fast as the outbox grows.
CREATE INDEX IF NOT EXISTS notification_outbox_processing_lock_idx
  ON notification_outbox (locked_at, created_at)
  WHERE status = 'PROCESSING';

CREATE INDEX IF NOT EXISTS notification_outbox_retry_idx
  ON notification_outbox (available_at, created_at)
  WHERE status IN ('PENDING', 'FAILED');

COMMIT;
