import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { MikroOrmCrudService } from '@nestjsx/crud-mikro-orm';

import { User } from './user.entity';

@Injectable()
export class UsersService extends MikroOrmCrudService<User> {
  constructor(@InjectRepository(User) repo) {
    super(repo);
  }
}
