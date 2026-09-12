import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

type NotificationChannel = 'SMS' | 'EMAIL' | 'WHATSAPP' | 'WEBHOOK';

@Injectable()
export class NotificationsService {
  constructor(@Inject(PG_POOL) private readonly db: Pool) {}

  async enqueue(
    tenantId: string,
    channel: NotificationChannel,
    recipient: string,
    eventType: string,
    payload: Record<string, unknown> = {},
    availableAt?: Date,
  ) {
    const result = await this.db.query(
      `INSERT INTO notification_outbox
        (tenant_id, channel, recipient, event_type, payload, available_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, status, available_at AS "availableAt", created_at AS "createdAt"`,
      [tenantId, channel, recipient.trim(), eventType.trim().toUpperCase(), payload, availableAt ?? new Date()],
    );
    return result.rows[0];
  }

  async claim(limit = 25) {
    const safeLimit = Math.min(Math.max(Math.trunc(limit || 25), 1), 100);
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `SELECT id, tenant_id AS "tenantId", channel, recipient, event_type AS "eventType", payload, attempts
         FROM notification_outbox
         WHERE status = 'PENDING' AND available_at <= now()
         ORDER BY created_at
         FOR UPDATE SKIP LOCKED
         LIMIT $1`,
        [safeLimit],
      );
      if (result.rowCount) {
        const ids = result.rows.map((row) => row.id);
        await client.query(
          `UPDATE notification_outbox
           SET status = 'PROCESSING', locked_at = now(), attempts = attempts + 1, updated_at = now()
           WHERE id = ANY($1::uuid[])`,
          [ids],
        );
      }
      await client.query('COMMIT');
      return result.rows;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async markSent(id: string) {
    const result = await this.db.query(
      `UPDATE notification_outbox
       SET status = 'SENT', sent_at = now(), locked_at = NULL, updated_at = now()
       WHERE id = $1 AND status = 'PROCESSING'
       RETURNING id, status, sent_at AS "sentAt"`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async markFailed(id: string, error: string, retryDelaySeconds = 60) {
    const delay = Math.min(Math.max(Math.trunc(retryDelaySeconds), 5), 86400);
    const result = await this.db.query(
      `UPDATE notification_outbox
       SET status = CASE WHEN attempts >= 8 THEN 'FAILED' ELSE 'PENDING' END,
           available_at = CASE WHEN attempts >= 8 THEN available_at ELSE now() + ($2 * interval '1 second') END,
           locked_at = NULL,
           last_error = left($3, 2000),
           updated_at = now()
       WHERE id = $1 AND status = 'PROCESSING'
       RETURNING id, status, attempts, available_at AS "availableAt"`,
      [id, delay, error || 'Unknown notification delivery error'],
    );
    return result.rows[0] ?? null;
  }

  async list(tenantId: string, limit = 100) {
    const safeLimit = Math.min(Math.max(Math.trunc(limit || 100), 1), 500);
    const result = await this.db.query(
      `SELECT id, channel, recipient, event_type AS "eventType", payload, status, attempts,
              available_at AS "availableAt", locked_at AS "lockedAt", sent_at AS "sentAt",
              last_error AS "lastError", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM notification_outbox
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [tenantId, safeLimit],
    );
    return { data: result.rows, count: result.rowCount ?? 0 };
  }
}
