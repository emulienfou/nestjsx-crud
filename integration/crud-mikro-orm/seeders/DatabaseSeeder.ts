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
    const company1 = em.create(Company, { id: 1, name: 'Name1', domain: 'Domain1' });
    const company2 = em.create(Company, { id: 2, name: 'Name2', domain: 'Domain2' });
    const company3 = em.create(Company, { id: 3, name: 'Name3', domain: 'Domain3' });
    const company4 = em.create(Company, { id: 4, name: 'Name4', domain: 'Domain4' });
    const company5 = em.create(Company, { id: 5, name: 'Name5', domain: 'Domain5' });
    const company6 = em.create(Company, { id: 6, name: 'Name6', domain: 'Domain6' });
    const company7 = em.create(Company, { id: 7, name: 'Name7', domain: 'Domain7' });
    const company8 = em.create(Company, { id: 8, name: 'Name8', domain: 'Domain8' });
    const company9 = em.create(Company, { id: 9, name: 'Name9', domain: 'Domain9', deletedAt: new Date() });
    const company10 = em.create(Company, { id: 10, name: 'Name10', domain: 'Domain10' });

    // projects
    const project1 = em.create(Project, { id: 1, name: 'Project1', description: 'description1', isActive: true, company: company1 });
    const project2 = em.create(Project, { id: 2, name: 'Project2', description: 'description2', isActive: true, company: company1 });
    const project3 = em.create(Project, { id: 3, name: 'Project3', description: 'description3', isActive: true, company: company2 });
    em.create(Project, { id: 4, name: 'Project4', description: 'description4', isActive: true, company: company2 });
    em.create(Project, { id: 5, name: 'Project5', description: 'description5', isActive: true, company: company3 });
    em.create(Project, { id: 6, name: 'Project6', description: 'description6', isActive: true, company: company3 });
    em.create(Project, { id: 7, name: 'Project7', description: 'description7', isActive: true, company: company4 });
    em.create(Project, { id: 8, name: 'Project8', description: 'description8', isActive: true, company: company4 });
    em.create(Project, { id: 9, name: 'Project9', description: 'description9', isActive: true, company: company5 });
    em.create(Project, { id: 10, name: 'Project10', description: 'description10', isActive: true, company: company5 });
    em.create(Project, { id: 11, name: 'Project11', description: 'description11', isActive: false, company: company6 });
    em.create(Project, { id: 12, name: 'Project12', description: 'description12', isActive: false, company: company6 });
    em.create(Project, { id: 13, name: 'Project13', description: 'description13', isActive: false, company: company7 });
    em.create(Project, { id: 14, name: 'Project14', description: 'description14', isActive: false, company: company7 });
    em.create(Project, { id: 15, name: 'Project15', description: 'description15', isActive: false, company: company8 });
    em.create(Project, { id: 16, name: 'Project16', description: 'description16', isActive: false, company: company8 });
    em.create(Project, { id: 17, name: 'Project17', description: 'description17', isActive: false, company: company9 });
    em.create(Project, { id: 18, name: 'Project18', description: 'description18', isActive: false, company: company9 });
    em.create(Project, { id: 19, name: 'Project19', description: 'description19', isActive: false, company: company10 });
    em.create(Project, { id: 20, name: 'Project20', description: 'description20', isActive: false, company: company10 });

    // user-profiles
    const profile1 = em.create(UserProfile, { id: 1, name: 'User1' });
    const profile2 = em.create(UserProfile, { id: 2, name: 'User2' });
    const profile3 = em.create(UserProfile, { id: 3, name: 'User3' });
    const profile4 = em.create(UserProfile, { id: 4, name: 'User4' });
    const profile5 = em.create(UserProfile, { id: 5, name: 'User5' });
    const profile6 = em.create(UserProfile, { id: 6, name: 'User6' });
    const profile7 = em.create(UserProfile, { id: 7, name: 'User7' });
    const profile8 = em.create(UserProfile, { id: 8, name: 'User8' });
    const profile9 = em.create(UserProfile, { id: 9, name: 'User9' });
    const profile10 = em.create(UserProfile, { id: 10, name: 'User1' });
    const profile11 = em.create(UserProfile, { id: 11, name: 'User1' });
    const profile12 = em.create(UserProfile, { id: 12, name: 'User1' });
    const profile13 = em.create(UserProfile, { id: 13, name: 'User1' });
    const profile14 = em.create(UserProfile, { id: 14, name: 'User1' });
    const profile15 = em.create(UserProfile, { id: 15, name: 'User1' });
    const profile16 = em.create(UserProfile, { id: 16, name: 'User1' });
    const profile17 = em.create(UserProfile, { id: 17, name: 'User1' });
    const profile18 = em.create(UserProfile, { id: 18, name: 'User1' });
    const profile19 = em.create(UserProfile, { id: 19, name: 'User1' });
    const profile20 = em.create(UserProfile, { id: 20, name: 'User2' });

    // users
    const name: Name = { first: null, last: null };
    const name1: Name = { first: 'firstname1', last: 'lastname1' };
    const user1 = em.create(User, { id: 1, email: '1@email.com', isActive: true, company: company1, profile: profile1, name: name1 });
    const user2 = em.create(User, { id: 2, email: '2@email.com', isActive: true, company: company1, profile: profile2, name });
    const user3 = em.create(User, { id: 3, email: '3@email.com', isActive: true, company: company1, profile: profile3, name });
    em.create(User, { id: 4, email: '4@email.com', isActive: true, company: company1, profile: profile4, name });
    em.create(User, { id: 5, email: '5@email.com', isActive: true, company: company1, profile: profile5, name });
    em.create(User, { id: 6, email: '6@email.com', isActive: true, company: company1, profile: profile6, name });
    em.create(User, { id: 7, email: '7@email.com', isActive: false, company: company1, profile: profile7, name });
    em.create(User, { id: 8, email: '8@email.com', isActive: false, company: company1, profile: profile8, name });
    em.create(User, { id: 9, email: '9@email.com', isActive: false, company: company1, profile: profile9, name });
    em.create(User, { id: 10, email: '10@email.com', isActive: true, company: company1, profile: profile10, name });
    em.create(User, { id: 11, email: '11@email.com', isActive: true, company: company2, profile: profile11, name });
    em.create(User, { id: 12, email: '12@email.com', isActive: true, company: company2, profile: profile12, name });
    em.create(User, { id: 13, email: '13@email.com', isActive: true, company: company2, profile: profile13, name });
    em.create(User, { id: 14, email: '14@email.com', isActive: true, company: company2, profile: profile14, name });
    em.create(User, { id: 15, email: '15@email.com', isActive: true, company: company2, profile: profile15, name });
    em.create(User, { id: 16, email: '16@email.com', isActive: true, company: company2, profile: profile16, name });
    em.create(User, { id: 17, email: '17@email.com', isActive: false, company: company2, profile: profile17, name });
    em.create(User, { id: 18, email: '18@email.com', isActive: false, company: company2, profile: profile18, name });
    em.create(User, { id: 19, email: '19@email.com', isActive: false, company: company2, profile: profile19, name });
    em.create(User, { id: 20, email: '20@email.com', isActive: false, company: company2, profile: profile20, name });
    em.create(User, { id: 21, email: '21@email.com', isActive: false, company: company2, profile: null, name });

    // licenses
    const license1 = em.create(License, { id: 1, name: 'License1' });
    const license2 = em.create(License, { id: 2, name: 'License2' });
    em.create(License, { id: 3, name: 'License3' });
    const license4 = em.create(License, { id: 4, name: 'License4' });
    const license5 = em.create(License, { id: 5, name: 'License5' });

    // user-licenses
    em.create(UserLicense, { user: user1, license: license1, yearsActive: 3 });
    em.create(UserLicense, { user: user1, license: license2, yearsActive: 5 });
    em.create(UserLicense, { user: user1, license: license4, yearsActive: 7 });
    em.create(UserLicense, { user: user2, license: license5, yearsActive: 1 });

    // user-projects
    em.create(UserProject, { project: project1, user: user1, review: 'User project 1 1' });
    em.create(UserProject, { project: project1, user: user2, review: 'User project 1 2' });
    em.create(UserProject, { project: project2, user: user2, review: 'User project 2 2' });
    em.create(UserProject, { project: project3, user: user3, review: 'User project 3 3' });

    // notes
    em.create(Note, { id: 1, revisionId: 1 });
    em.create(Note, { id: 2, revisionId: 1 });
    em.create(Note, { id: 3, revisionId: 2 });
    em.create(Note, { id: 4, revisionId: 2 });
    em.create(Note, { id: 5, revisionId: 3 });
    em.create(Note, { id: 6, revisionId: 3 });
  }
}
