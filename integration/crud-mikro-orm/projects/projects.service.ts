import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { MikroOrmCrudService } from '@nestjsx/crud-mikro-orm';

import { Project } from './project.entity';

@Injectable()
export class ProjectsService extends MikroOrmCrudService<Project> {
  constructor(@InjectRepository(Project) repo) {
    super(repo);
  }
}
