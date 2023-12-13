import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Name } from '../../crud-typeorm/users';
import { Company } from '../companies';
import { Note } from '../notes';
import { Project, UserProject } from '../projects';
import { User } from '../users';
import { License, UserLicense } from '../users-licenses';
import { UserProfile } from '../users-profiles';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // companies
    em.create(Company, { id: 1, name: 'Name1', domain: 'Domain1' });
    em.create(Company, { id: 2, name: 'Name2', domain: 'Domain2' });
    em.create(Company, { id: 3, name: 'Name3', domain: 'Domain3' });
    em.create(Company, { id: 4, name: 'Name4', domain: 'Domain4' });
    em.create(Company, { id: 5, name: 'Name5', domain: 'Domain5' });
    em.create(Company, { id: 6, name: 'Name6', domain: 'Domain6' });
    em.create(Company, { id: 7, name: 'Name7', domain: 'Domain7' });
    em.create(Company, { id: 8, name: 'Name8', domain: 'Domain8' });
    em.create(Company, { id: 9, name: 'Name9', domain: 'Domain9', deletedAt: new Date() });
    em.create(Company, { id: 10, name: 'Name10', domain: 'Domain10' });

    // projects
    em.create(Project, { id: 1, name: 'Project1', description: 'description1', isActive: true, companyId: 1 });
    em.create(Project, { id: 2, name: 'Project2', description: 'description2', isActive: true, companyId: 1 });
    em.create(Project, { id: 3, name: 'Project3', description: 'description3', isActive: true, companyId: 2 });
    em.create(Project, { id: 4, name: 'Project4', description: 'description4', isActive: true, companyId: 2 });
    em.create(Project, { id: 5, name: 'Project5', description: 'description5', isActive: true, companyId: 3 });
    em.create(Project, { id: 6, name: 'Project6', description: 'description6', isActive: true, companyId: 3 });
    em.create(Project, { id: 7, name: 'Project7', description: 'description7', isActive: true, companyId: 4 });
    em.create(Project, { id: 8, name: 'Project8', description: 'description8', isActive: true, companyId: 4 });
    em.create(Project, { id: 9, name: 'Project9', description: 'description9', isActive: true, companyId: 5 });
    em.create(Project, { id: 10, name: 'Project10', description: 'description10', isActive: true, companyId: 5 });
    em.create(Project, { id: 11, name: 'Project11', description: 'description11', isActive: false, companyId: 6 });
    em.create(Project, { id: 12, name: 'Project12', description: 'description12', isActive: false, companyId: 6 });
    em.create(Project, { id: 13, name: 'Project13', description: 'description13', isActive: false, companyId: 7 });
    em.create(Project, { id: 14, name: 'Project14', description: 'description14', isActive: false, companyId: 7 });
    em.create(Project, { id: 15, name: 'Project15', description: 'description15', isActive: false, companyId: 8 });
    em.create(Project, { id: 16, name: 'Project16', description: 'description16', isActive: false, companyId: 8 });
    em.create(Project, { id: 17, name: 'Project17', description: 'description17', isActive: false, companyId: 9 });
    em.create(Project, { id: 18, name: 'Project18', description: 'description18', isActive: false, companyId: 9 });
    em.create(Project, { id: 19, name: 'Project19', description: 'description19', isActive: false, companyId: 10 });
    em.create(Project, { id: 20, name: 'Project20', description: 'description20', isActive: false, companyId: 10 });

    // user-profiles
    em.create(UserProfile, { id: 1, name: 'User1' });
    em.create(UserProfile, { id: 2, name: 'User2' });
    em.create(UserProfile, { id: 3, name: 'User3' });
    em.create(UserProfile, { id: 4, name: 'User4' });
    em.create(UserProfile, { id: 5, name: 'User5' });
    em.create(UserProfile, { id: 6, name: 'User6' });
    em.create(UserProfile, { id: 7, name: 'User7' });
    em.create(UserProfile, { id: 8, name: 'User8' });
    em.create(UserProfile, { id: 9, name: 'User9' });
    em.create(UserProfile, { id: 10, name: 'User1' });
    em.create(UserProfile, { id: 11, name: 'User1' });
    em.create(UserProfile, { id: 12, name: 'User1' });
    em.create(UserProfile, { id: 13, name: 'User1' });
    em.create(UserProfile, { id: 14, name: 'User1' });
    em.create(UserProfile, { id: 15, name: 'User1' });
    em.create(UserProfile, { id: 16, name: 'User1' });
    em.create(UserProfile, { id: 17, name: 'User1' });
    em.create(UserProfile, { id: 18, name: 'User1' });
    em.create(UserProfile, { id: 19, name: 'User1' });
    em.create(UserProfile, { id: 20, name: 'User2' });

    // users
    const name: Name = { first: null, last: null };
    const name1: Name = { first: 'firstname1', last: 'lastname1' };
    em.create(User, { id: 1, email: '1@email.com', isActive: true, companyId: 1, profileId: 1, name: name1 });
    em.create(User, { id: 2, email: '2@email.com', isActive: true, companyId: 1, profileId: 2, name });
    em.create(User, { id: 3, email: '3@email.com', isActive: true, companyId: 1, profileId: 3, name });
    em.create(User, { id: 4, email: '4@email.com', isActive: true, companyId: 1, profileId: 4, name });
    em.create(User, { id: 5, email: '5@email.com', isActive: true, companyId: 1, profileId: 5, name });
    em.create(User, { id: 6, email: '6@email.com', isActive: true, companyId: 1, profileId: 6, name });
    em.create(User, { id: 7, email: '7@email.com', isActive: false, companyId: 1, profileId: 7, name });
    em.create(User, { id: 8, email: '8@email.com', isActive: false, companyId: 1, profileId: 8, name });
    em.create(User, { id: 9, email: '9@email.com', isActive: false, companyId: 1, profileId: 9, name });
    em.create(User, { id: 10, email: '10@email.com', isActive: true, companyId: 1, profileId: 10, name });
    em.create(User, { id: 11, email: '11@email.com', isActive: true, companyId: 2, profileId: 11, name });
    em.create(User, { id: 12, email: '12@email.com', isActive: true, companyId: 2, profileId: 12, name });
    em.create(User, { id: 13, email: '13@email.com', isActive: true, companyId: 2, profileId: 13, name });
    em.create(User, { id: 14, email: '14@email.com', isActive: true, companyId: 2, profileId: 14, name });
    em.create(User, { id: 15, email: '15@email.com', isActive: true, companyId: 2, profileId: 15, name });
    em.create(User, { id: 16, email: '16@email.com', isActive: true, companyId: 2, profileId: 16, name });
    em.create(User, { id: 17, email: '17@email.com', isActive: false, companyId: 2, profileId: 17, name });
    em.create(User, { id: 18, email: '18@email.com', isActive: false, companyId: 2, profileId: 18, name });
    em.create(User, { id: 19, email: '19@email.com', isActive: false, companyId: 2, profileId: 19, name });
    em.create(User, { id: 20, email: '20@email.com', isActive: false, companyId: 2, profileId: 20, name });
    em.create(User, { id: 21, email: '21@email.com', isActive: false, companyId: 2, profileId: null, name });

    // licenses
    em.create(License, { id: 1, name: 'License1' });
    em.create(License, { id: 2, name: 'License2' });
    em.create(License, { id: 3, name: 'License3' });
    em.create(License, { id: 4, name: 'License4' });
    em.create(License, { id: 5, name: 'License5' });

    // user-licenses
    em.create(UserLicense, { userId: 1, licenseId: 1, yearsActive: 3 });
    em.create(UserLicense, { userId: 1, licenseId: 2, yearsActive: 5 });
    em.create(UserLicense, { userId: 1, licenseId: 4, yearsActive: 7 });
    em.create(UserLicense, { userId: 2, licenseId: 5, yearsActive: 1 });

    // user-projects
    em.create(UserProject, { projectId: 1, userId: 1, review: 'User project 1 1' });
    em.create(UserProject, { projectId: 1, userId: 2, review: 'User project 1 2' });
    em.create(UserProject, { projectId: 2, userId: 2, review: 'User project 2 2' });
    em.create(UserProject, { projectId: 3, userId: 3, review: 'User project 3 3' });

    // notes
    em.create(Note, { id: 1, revisionId: 1 });
    em.create(Note, { id: 2, revisionId: 1 });
    em.create(Note, { id: 3, revisionId: 2 });
    em.create(Note, { id: 4, revisionId: 2 });
    em.create(Note, { id: 5, revisionId: 3 });
    em.create(Note, { id: 6, revisionId: 3 });
  }
}
