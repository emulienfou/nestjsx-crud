import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Company } from './company.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Company])],
  providers: [CompaniesService],
  exports: [CompaniesService],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
