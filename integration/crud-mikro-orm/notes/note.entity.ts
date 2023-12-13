import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'notes' })
export class Note {
  @PrimaryKey()
  id: number;

  @Property({ name: 'revision_id', nullable: false })
  revisionId: number;
}
