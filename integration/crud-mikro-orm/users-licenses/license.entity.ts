import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../base-entity';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@Entity({ tableName: 'licenses' })
export class License extends BaseEntity {
  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(32, { always: true })
  @Property({ type: 'varchar', length: 32, nullable: true, default: null })
  name: string;
}
