import { defineConfig } from '@mikro-orm/core';
import { join } from 'path';
import { Company } from './companies';
import { Device } from './devices';
import { Note } from './notes';
import { Project, UserProject } from './projects';
import { User } from './users';
import { UserLicense } from './users-licenses';

const type = (process.env.MIKRO_ORM_CONNECTION as any) || 'postgresql';

export default defineConfig({
  type,
  debug: true,
  host: '127.0.0.1',
  port: type === 'postgresql' ? 5455 : 3316,
  user: type === 'mysql' ? 'nestjsx_crud' : 'root',
  password: type === 'mysql' ? 'nestjsx_crud' : 'root',
  dbName: 'nestjsx_crud',
  entities: [Company, Device, Note, Project, User, UserLicense, UserProject],
  tsNode: true,
  migrations: {
    tableName: 'orm_migrations',
    pathTs: join(__dirname, './migrations'),
  },
  seeder: {
    pathTs: join(__dirname, './seeders'),
  },
});
