import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthGuard } from './auth.guard';
import options from './mikro-orm.config';
import { CompaniesModule } from './companies/companies.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(options),
    CompaniesModule,
    ProjectsModule,
    UsersModule,
    DevicesModule,
    NotesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
