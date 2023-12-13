import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { Device } from './device.entity';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Device])],
  providers: [DevicesService],
  exports: [DevicesService],
  controllers: [DevicesController],
})
export class DevicesModule {}
