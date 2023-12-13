import { Cascade, Entity, ManyToMany, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { CrudValidationGroups } from '@nestjsx/crud';
import { IsBoolean, IsDefined, IsOptional, IsString, MaxLength } from 'class-validator';

import { BaseEntity } from '../base-entity';
import { Company } from '../companies';
import { User } from '../users';
import { UserProject } from './user-project.entity';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({ tableName: 'projects' })
export class Project extends BaseEntity {
  @IsOptional({ groups: [UPDATE] })
  @IsDefined({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(100, { always: true })
  @Property({ type: 'varchar', length: 100, nullable: false, unique: true })
  name?: string;

  @IsOptional({ always: true })
  @Property({ type: 'text', nullable: true })
  description?: string;

  @IsOptional({ always: true })
  @IsBoolean({ always: true })
  @Property({ type: 'boolean', default: true })
  isActive?: boolean;

  /**
   * Relations
   */

  @ManyToOne(() => Company, { inversedBy: 'projects', nullable: true })
  company?: Company;

  @ManyToMany(() => User, (u) => u.projects, { cascade: [Cascade.ALL] })
  users?: User[];

  @OneToMany(() => UserProject, (el) => el.project, {
    orphanRemoval: true,
  })
  userProjects!: UserProject[];
}
