import { PrimaryKey, Property } from '@mikro-orm/core';

export class BaseEntity {
  @PrimaryKey()
  id?: number;

  @Property({ onCreate: () => new Date(), defaultRaw: 'CURRENT_TIMESTAMP', nullable: true })
  createdAt?: Date;

  @Property({ onUpdate: () => new Date(), defaultRaw: 'CURRENT_TIMESTAMP', nullable: true })
  updatedAt?: Date;
}
