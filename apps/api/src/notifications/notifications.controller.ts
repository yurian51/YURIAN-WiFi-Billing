import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard, RolesGuard)
@Roles('OWNER', 'ADMIN')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('outbox')
  list(@Req() req: AuthenticatedRequest, @Query('limit') limit?: string) {
    return this.notifications.list(req.user!.tenantId, Number(limit) || 100);
  }

  @Get('stats')
  stats(@Req() req: AuthenticatedRequest) {
    return this.notifications.stats(req.user!.tenantId);
  }

  @Post('recover-stale')
  recoverStale(@Req() req: AuthenticatedRequest, @Query('maxAgeMinutes') maxAgeMinutes?: string) {
    return this.notifications.recoverStaleProcessing(req.user!.tenantId, Number(maxAgeMinutes) || 15);
  }
}
