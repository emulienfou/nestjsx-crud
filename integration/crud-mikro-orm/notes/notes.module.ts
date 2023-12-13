import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { Note } from './note.entity';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Note])],
  providers: [NotesService],
  exports: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
