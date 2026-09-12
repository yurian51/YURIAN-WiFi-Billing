BEGIN;

-- Provider event identifiers are scoped to a tenant. A provider may legally
-- reuse an event identifier in a different merchant/account, so global
-- uniqueness would incorrectly make one tenant's webhook a duplicate of another.
DROP INDEX IF EXISTS payment_events_provider_event_uq;

CREATE UNIQUE INDEX IF NOT EXISTS payment_events_tenant_provider_event_uq
  ON payment_events (tenant_id, provider, provider_event_id)
  WHERE provider_event_id IS NOT NULL;

COMMIT;
