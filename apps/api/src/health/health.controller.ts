import { Controller, Get, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Controller('health')
export class HealthController {
  constructor(@Inject(PG_POOL) private readonly db: Pool) {}

  @Get()
  check() {
    return { status: 'ok', service: 'jaslyn-net-api', product: 'JASLYN NET', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  async ready() {
    const result = await this.db.query('select 1 as ok');
    return {
      status: result.rows[0]?.ok === 1 ? 'ready' : 'not_ready',
      service: 'jaslyn-net-api',
      product: 'JASLYN NET',
      database: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
