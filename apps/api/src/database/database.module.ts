import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_POOL = Symbol('PG_POOL');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL is required');
        }

        const sslMode = config.get<string>('DATABASE_SSL', 'require').toLowerCase();
        const ssl = sslMode === 'disable'
          ? undefined
          : { rejectUnauthorized: sslMode === 'verify-full' };

        return new Pool({
          connectionString: databaseUrl,
          ssl,
          max: config.get<number>('DATABASE_POOL_MAX', 10),
          idleTimeoutMillis: config.get<number>('DATABASE_IDLE_TIMEOUT_MS', 30_000),
          connectionTimeoutMillis: config.get<number>('DATABASE_CONNECTION_TIMEOUT_MS', 5_000),
          maxUses: config.get<number>('DATABASE_POOL_MAX_USES', 0) || undefined,
        });
      },
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
