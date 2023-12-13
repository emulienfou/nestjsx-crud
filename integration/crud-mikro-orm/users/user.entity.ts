import { Cascade, Collection, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, Property } from '@mikro-orm/core';
import { CrudValidationGroups } from '@nestjsx/crud';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

import { BaseEntity } from '../base-entity';
import { Company } from '../companies';
import { Project } from '../projects';
import { UserProject } from '../projects';
import { UserLicense } from '../users-licenses';
import { UserProfile } from '../users-profiles';

const { CREATE, UPDATE } = CrudValidationGroups;

export class Name {
  @IsString({ always: true })
  @Property({ nullable: true })
  first: string;

  @IsString({ always: true })
  @Property({ nullable: true })
  last: string;
}

// tslint:disable-next-line:max-classes-per-file
@Entity({ tableName: 'users' })
export class User extends BaseEntity {
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @IsEmail({ require_tld: false }, { always: true })
  @Property({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Property({ type: 'boolean', default: true })
  isActive: boolean;

  @Property({ type: Name })
  name: Name;

  @Property({ nullable: true })
  deletedAt?: Date;

  /**
   * Relations
   */

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @ValidateNested({ always: true })
  @OneToOne(() => UserProfile, (p) => p.user, { cascade: [Cascade.ALL], owner: true })
  profile?: UserProfile;

  @ManyToOne(() => Company, { inversedBy: 'users' })
  company?: Company;

  @ManyToMany(() => Project, (c) => c.users, { owner: true })
  projects = new Collection<Project>(this);

  @OneToMany(() => UserProject, (el) => el.user, {
    orphanRemoval: true,
  })
  userProjects = new Collection<UserProject>(this);

  @OneToMany(() => UserLicense, (ul) => ul.user)
  userLicenses = new Collection<UserLicense>(this);
}
