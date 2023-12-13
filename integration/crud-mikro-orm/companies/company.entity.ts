import { Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { CrudValidationGroups } from '@nestjsx/crud';
import { Type } from 'class-transformer';
import { IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

import { BaseEntity } from '../base-entity';
import { Project } from '../projects';
import { User } from '../users';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({ tableName: 'companies' })
export class Company extends BaseEntity {
  @IsOptional({ groups: [UPDATE] })
  @IsEmpty({ groups: [CREATE] })
  @IsNumber({}, { groups: [UPDATE] })
  @PrimaryKey()
  id?: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(100, { always: true })
  @Property({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ groups: [CREATE, UPDATE] })
  @MaxLength(100, { groups: [CREATE, UPDATE] })
  @Property({ type: 'varchar', length: 100, nullable: false, unique: true })
  domain: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @Property({ type: 'text', nullable: true, default: null })
  description: string;

  @Property({ nullable: true })
  deletedAt?: Date;

  /**
   * Relations
   */

  @OneToMany(() => User, (u) => u.company)
  @Type(() => User)
  users: User[];

  @OneToMany(() => Project, (p) => p.company)
  projects: Project[];
}
