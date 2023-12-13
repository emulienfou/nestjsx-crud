import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { MikroOrmCrudService } from '@nestjsx/crud-mikro-orm';

import { UserProject } from './user-project.entity';

@Injectable()
export class UserProjectsService extends MikroOrmCrudService<UserProject> {
  constructor(@InjectRepository(UserProject) repo) {
    super(repo);
  }
}
