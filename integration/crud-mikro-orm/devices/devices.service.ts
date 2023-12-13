import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { MikroOrmCrudService } from '@nestjsx/crud-mikro-orm';

import { Device } from './device.entity';

@Injectable()
export class DevicesService extends MikroOrmCrudService<Device> {
  constructor(@InjectRepository(Device) repo) {
    super(repo);
  }
}
