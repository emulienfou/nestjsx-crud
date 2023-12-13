import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';

import { MikroOrmCrudService } from '../../../crud-mikro-orm/src/mikro-orm-crud.service';
import { User } from '../../../../integration/crud-mikro-orm/users';

@Injectable()
export class UsersService extends MikroOrmCrudService<User> {
  constructor(@InjectRepository(User) repo) {
    super(repo);
  }
}

@Injectable()
export class UsersService2 extends MikroOrmCrudService<User> {
  constructor(@InjectRepository(User) repo) {
    super(repo);
  }
}
