import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { CrudValidationGroups } from '@nestjsx/crud';
import { IsOptional, IsString, IsUUID } from 'class-validator';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({ tableName: 'devices' })
export class Device {
  @IsOptional({ always: true })
  @IsUUID('4', { always: true })
  @PrimaryKey({ type: 'uuid' })
  deviceKey: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @Property({ type: 'text', nullable: true })
  description?: string;
}
