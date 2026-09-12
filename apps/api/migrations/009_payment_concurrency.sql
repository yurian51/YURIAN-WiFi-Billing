BEGIN;

-- A WiFi purchase can have many historical payment records, but only one
-- outstanding payment attempt at a time. This closes the database-level race
-- left between application checks and INSERT.
CREATE UNIQUE INDEX IF NOT EXISTS payments_one_pending_per_purchase_uq
  ON payments (tenant_id, purchase_id)
  WHERE purchase_id IS NOT NULL AND status = 'PENDING';

COMMIT;
