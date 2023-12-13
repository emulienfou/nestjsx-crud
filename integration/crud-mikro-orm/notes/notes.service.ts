import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { MikroOrmCrudService } from '@nestjsx/crud-mikro-orm';

import { Note } from './note.entity';

@Injectable()
export class NotesService extends MikroOrmCrudService<Note> {
  constructor(@InjectRepository(Note) repo) {
    super(repo);
  }
}
