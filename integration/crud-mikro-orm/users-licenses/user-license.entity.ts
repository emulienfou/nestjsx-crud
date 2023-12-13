import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../users';
import { License } from './license.entity';

@Entity({ tableName: 'user_licenses' })
export class UserLicense {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => License, { nullable: true })
  license: License;

  @Property()
  yearsActive: number;
}
