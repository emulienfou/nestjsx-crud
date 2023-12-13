import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { MikroOrmCrudService } from '@nestjsx/crud-mikro-orm';
import { Company } from './company.entity';

@Injectable()
export class CompaniesService extends MikroOrmCrudService<Company> {
  constructor(@InjectRepository(Company) repo) {
    super(repo);
  }
}
