import { Controller, Get } from '@nestjs/common';

@Controller('ready')
export class ReadinessController {
  @Get()
  getReadiness() {
    return {
      status: 'ready',
      service: 'jaslyn-net-api',
      product: 'JASLYN NET',
      timestamp: new Date().toISOString(),
    };
  }
}
