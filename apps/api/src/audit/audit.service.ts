import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

export type AuditContext = {
  userId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class AuditService {
  constructor(@Inject(PG_POOL) private readonly db: Pool) {}

  async record(
    tenantId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata: Record<string, unknown> = {},
    context: AuditContext = {},
  ) {
    const result = await this.db.query(
      `INSERT INTO audit_logs
        (tenant_id, actor_user_id, action, resource_type, resource_id, request_id, ip_address, user_agent, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, created_at AS "createdAt"`,
      [
        tenantId,
        context.userId ?? null,
        action.trim().toUpperCase(),
        resourceType.trim().toLowerCase(),
        resourceId ?? null,
        context.requestId ?? null,
        context.ipAddress ?? null,
        context.userAgent ?? null,
        metadata,
      ],
    );
    return result.rows[0];
  }

  async list(tenantId: string, limit = 100) {
    const safeLimit = Math.min(Math.max(Math.trunc(limit || 100), 1), 500);
    const result = await this.db.query(
      `SELECT
         a.id,
         a.action,
         a.resource_type AS "resourceType",
         a.resource_id AS "resourceId",
         a.request_id AS "requestId",
         a.ip_address AS "ipAddress",
         a.user_agent AS "userAgent",
         a.metadata,
         a.created_at AS "createdAt",
         u.id AS "actorUserId",
         u.full_name AS "actorName",
         u.email AS "actorEmail"
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.actor_user_id AND u.tenant_id = a.tenant_id
       WHERE a.tenant_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2`,
      [tenantId, safeLimit],
    );
    return { data: result.rows, count: result.rowCount ?? 0 };
  }
}
