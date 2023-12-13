import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../users';
import { Project } from './project.entity';

@Entity({ tableName: 'user_projects' })
export class UserProject {
  @PrimaryKey()
  public projectId!: number;

  @PrimaryKey()
  public userId!: number;

  @Property({ nullable: true })
  public review!: string;

  @ManyToOne(() => Project, {
    inversedBy: 'userProjects',
    onDelete: 'CASCADE',
    nullable: true,
  })
  public project: Project;

  @ManyToOne(() => User, {
    inversedBy: 'userProjects',
    nullable: true,
  })
  public user: User;
}
