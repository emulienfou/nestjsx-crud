import { Migration } from '@mikro-orm/migrations';

export class Migration20231212143837 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "companies" ("id" serial primary key, "created_at" timestamptz(0) null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "name" varchar(100) not null, "domain" varchar(100) not null, "description" text null default null, "deleted_at" timestamptz(0) null);');
    this.addSql('alter table "companies" add constraint "companies_domain_unique" unique ("domain");');

    this.addSql('create table "devices" ("device_key" uuid not null, "description" text null, constraint "devices_pkey" primary key ("device_key"));');

    this.addSql('create table "licenses" ("id" serial primary key, "created_at" timestamptz(0) null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "name" varchar(32) null default null);');

    this.addSql('create table "notes" ("id" serial primary key, "revision_id" int not null);');

    this.addSql('create table "projects" ("id" serial primary key, "created_at" timestamptz(0) null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "name" varchar(100) not null, "description" text null, "is_active" boolean not null default true, "company_id" int not null);');
    this.addSql('alter table "projects" add constraint "projects_name_unique" unique ("name");');

    this.addSql('create table "user_profiles" ("id" serial primary key, "created_at" timestamptz(0) null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "name" varchar(32) null default null, "deleted_at" timestamptz(0) null);');

    this.addSql('create table "users" ("id" serial primary key, "created_at" timestamptz(0) null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "email" varchar(255) not null, "is_active" boolean not null default true, "name" varchar(255) not null, "profile_id" int null, "company_id" int not null, "deleted_at" timestamptz(0) null);');
    this.addSql('alter table "users" add constraint "users_email_unique" unique ("email");');
    this.addSql('alter table "users" add constraint "users_profile_id_unique" unique ("profile_id");');

    this.addSql('create table "user_licenses" ("user_id" int not null, "license_id" int not null, "years_active" int not null, constraint "user_licenses_pkey" primary key ("user_id", "license_id"));');

    this.addSql('create table "user_projects" ("project_id" int not null, "user_id" int not null, "review" varchar(255) null, constraint "user_projects_pkey" primary key ("project_id", "user_id"));');

    this.addSql('create table "users_projects" ("user_id" int not null, "project_id" int not null, constraint "users_projects_pkey" primary key ("user_id", "project_id"));');

    this.addSql('alter table "projects" add constraint "projects_company_id_foreign" foreign key ("company_id") references "companies" ("id") on update cascade;');

    this.addSql('alter table "users" add constraint "users_profile_id_foreign" foreign key ("profile_id") references "user_profiles" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "users" add constraint "users_company_id_foreign" foreign key ("company_id") references "companies" ("id") on update cascade;');

    this.addSql('alter table "user_licenses" add constraint "user_licenses_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;');
    this.addSql('alter table "user_licenses" add constraint "user_licenses_license_id_foreign" foreign key ("license_id") references "licenses" ("id") on update cascade;');

    this.addSql('alter table "user_projects" add constraint "user_projects_project_id_foreign" foreign key ("project_id") references "projects" ("id") on update cascade on delete CASCADE;');
    this.addSql('alter table "user_projects" add constraint "user_projects_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;');

    this.addSql('alter table "users_projects" add constraint "users_projects_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "users_projects" add constraint "users_projects_project_id_foreign" foreign key ("project_id") references "projects" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "projects" drop constraint "projects_company_id_foreign";');

    this.addSql('alter table "users" drop constraint "users_company_id_foreign";');

    this.addSql('alter table "user_licenses" drop constraint "user_licenses_license_id_foreign";');

    this.addSql('alter table "user_projects" drop constraint "user_projects_project_id_foreign";');

    this.addSql('alter table "users_projects" drop constraint "users_projects_project_id_foreign";');

    this.addSql('alter table "users" drop constraint "users_profile_id_foreign";');

    this.addSql('alter table "user_licenses" drop constraint "user_licenses_user_id_foreign";');

    this.addSql('alter table "user_projects" drop constraint "user_projects_user_id_foreign";');

    this.addSql('alter table "users_projects" drop constraint "users_projects_user_id_foreign";');

    this.addSql('drop table if exists "companies" cascade;');

    this.addSql('drop table if exists "devices" cascade;');

    this.addSql('drop table if exists "licenses" cascade;');

    this.addSql('drop table if exists "notes" cascade;');

    this.addSql('drop table if exists "projects" cascade;');

    this.addSql('drop table if exists "user_profiles" cascade;');

    this.addSql('drop table if exists "users" cascade;');

    this.addSql('drop table if exists "user_licenses" cascade;');

    this.addSql('drop table if exists "user_projects" cascade;');

    this.addSql('drop table if exists "users_projects" cascade;');
  }

}
