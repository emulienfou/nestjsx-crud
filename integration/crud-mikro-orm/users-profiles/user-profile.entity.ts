import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { BaseEntity } from '../base-entity';
import { User } from '../users';

@Entity({ tableName: 'user_profiles' })
export class UserProfile extends BaseEntity {
  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(32, { always: true })
  @Property({ type: 'varchar', length: 32, nullable: true, default: null })
  name: string;

  @Property({ nullable: true })
  deletedAt?: Date;

  /**
   * Relations
   */
  @OneToOne(() => User, (u) => u.profile)
  user?: User;
}
