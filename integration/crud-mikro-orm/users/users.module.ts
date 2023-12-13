import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { User } from './user.entity';
import { UserProfile } from '../users-profiles';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MeController } from './me.controller';

@Module({
  imports: [MikroOrmModule.forFeature([User, UserProfile])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController, MeController],
})
export class UsersModule {}
