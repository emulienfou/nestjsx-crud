import { Entity, PrimaryKey, Property, UuidType } from '@mikro-orm/core';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { v4 as uuidv4 } from "uuid";

@Entity({ tableName: 'devices' })
export class Device {
  @IsOptional({ always: true })
  @IsUUID('4', { always: true })
  @PrimaryKey({ type: UuidType, defaultRaw: "uuid_generate_v4()" })
  deviceKey: string = uuidv4();

  @IsOptional({ always: true })
  @IsString({ always: true })
  @Property({ type: 'text', nullable: true })
  description?: string;
}
