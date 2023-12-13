import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Type } from 'class-transformer';
import { User } from '../users';
import { License } from './license.entity';

@Entity({ tableName: 'user_licenses' })
export class UserLicense {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @Type(() => User)
  user: User;

  @ManyToOne(() => License, { nullable: true })
  @Type(() => License)
  license: License;

  @Property()
  yearsActive: number;
}
