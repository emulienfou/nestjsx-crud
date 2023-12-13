import { Constructor, EntityMetadata, EntityRepository } from '@mikro-orm/core';
import { RequiredEntityData } from '@mikro-orm/core/typings';
import { QueryBuilder } from '@mikro-orm/knex';
import { EntityManager as MySQLEntityManager, EntityRepository as MySQLEntityRepository } from '@mikro-orm/mysql';
import {
  EntityManager as PostgreSQLEntityManager,
  EntityRepository as PostgreSQLEntityRepository,
} from '@mikro-orm/postgresql';
import {
  CreateManyDto,
  CrudRequest,
  CrudRequestOptions,
  CrudService,
  GetManyDefaultResponse,
  QueryOptions,
} from '@nestjsx/crud';
import { ParsedRequestParams, QuerySort } from '@nestjsx/crud-request';
import { hasLength, isArrayFull, isNil, isObject, isUndefined, ObjectLiteral, objKeys } from '@nestjsx/util';

interface IAllowedRelation {
  alias?: string;
  nested: boolean;
  name: string;
  path: string;
  columns: string[];
  primaryColumns: string[];
  allowedColumns: string[];
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class MikroOrmCrudService<T extends object> extends CrudService<T> {
  protected dbName: string;

  protected entityColumns: string[];

  protected entityPrimaryColumns: string[];

  protected entityHasDeleteColumn = false;

  protected entityColumnsHash: ObjectLiteral = {};

  protected entityRelationsHash: Map<string, IAllowedRelation> = new Map();

  protected sqlInjectionRegEx: RegExp[] = [
    /(%27)|(\')|(--)|(%23)|(#)/gi,
    /((%3D)|(=))[^\n]*((%27)|(\')|(--)|(%3B)|(;))/gi,
    /w*((%27)|(\'))((%6F)|o|(%4F))((%72)|r|(%52))/gi,
    /((%27)|(\'))union/gi,
  ];

  private readonly em: MySQLEntityManager | PostgreSQLEntityManager;

  private readonly metadata: EntityMetadata<T>;

  constructor(protected repo: MySQLEntityRepository<T> | PostgreSQLEntityRepository<T>) {
    super();

    this.em = repo.getEntityManager();
    this.metadata = this.em.getMetadata(repo.getEntityName());
    this.dbName = this.metadata.name;
    this.onInitMapEntityColumns();
  }

  public get findOne(): EntityRepository<T>['findOne'] {
    return this.repo.findOne.bind(this.repo);
  }

  public get find(): EntityRepository<T>['find'] {
    return this.repo.find.bind(this.repo);
  }

  public get count(): EntityRepository<T>['count'] {
    return this.repo.count.bind(this.repo);
  }

  protected get entityType(): Constructor<T> {
    throw this.metadata.class;
  }

  /**
   * Get entity name
   * @protected
   */
  protected get entityName(): string {
    return this.em.getMetadata(this.repo.getEntityName()).className;
  }

  /**
   *
   * @protected
   */
  protected get alias(): string {
    return this.em.getMetadata(this.repo.getEntityName()).tableName;
  }

  /**
   * Get many
   * @param req
   */
  public async getMany(req: CrudRequest): Promise<GetManyDefaultResponse<T> | T[]> {
    const { parsed, options } = req;
    const builder = this.createBuilder(parsed, options);
    return this.doGetMany(builder, parsed, options);
  }

  /**
   * Get one
   * @param req
   */
  public async getOne(req: CrudRequest): Promise<T> {
    return this.getOneOrFail(req);
  }

  /**
   * Create one
   * @param req
   * @param dto
   */
  public async createOne(req: CrudRequest, dto: T | Partial<T>): Promise<T> {
    const { returnShallow } = req.options.routes.createOneBase;
    const entity = await this.repo.create<T>(dto as RequiredEntityData<T>);

    /* istanbul ignore if */
    if (!entity) {
      this.throwBadRequestException('Empty data. Nothing to save.');
    }

    await this.em.persistAndFlush(entity);

    if (returnShallow) {
      return entity;
    } else {
      const primaryParams = this.getPrimaryParams(req.options);

      /* istanbul ignore next */
      if (!primaryParams.length && primaryParams.some((p) => isNil(entity[p]))) {
        return entity;
      } else {
        req.parsed.search = primaryParams.reduce((acc, p) => ({ ...acc, [p]: entity[p] }), {});
        return this.getOneOrFail(req);
      }
    }
  }

  /**
   * Create many
   * @param req
   * @param dto
   */
  public async createMany(req: CrudRequest, dto: CreateManyDto<T | Partial<T>>): Promise<T[]> {
    /* istanbul ignore if */
    if (!isObject(dto) || !isArrayFull(dto.bulk)) {
      this.throwBadRequestException('Empty data. Nothing to save.');
    }

    const bulk = dto.bulk.filter((d) => !isUndefined(d));

    /* istanbul ignore if */
    if (!hasLength(bulk)) {
      this.throwBadRequestException('Empty data. Nothing to save.');
    }

    bulk.map((entity) => {
      this.em.persist(entity);
    });

    await this.em.flush();

    return;
  }

  updateOne(req: CrudRequest, dto: T | Partial<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }

  replaceOne(req: CrudRequest, dto: T | Partial<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }

  deleteOne(req: CrudRequest): Promise<void | T> {
    throw new Error('Method not implemented.');
  }

  recoverOne(req: CrudRequest): Promise<void | T> {
    throw new Error('Method not implemented.');
  }

  /**
   * Create TypeOrm QueryBuilder
   * @param parsed
   * @param options
   * @param many
   * @param withDeleted
   */
  public createBuilder(
    parsed: ParsedRequestParams,
    options: CrudRequestOptions,
    many = true,
    withDeleted = false,
  ): QueryBuilder<T> {
    // create query builder
    const builder = this.em.createQueryBuilder<T>(this.entityName, this.alias);
    // get select fields
    const select = this.getSelect(parsed, options.query);
    // select fields
    builder.select(select);

    // search
    // this.setSearchCondition(builder, parsed.search);

    // set joins
    const joinOptions = options.query.join || {};
    const allowedJoins = objKeys(joinOptions);

    if (hasLength(allowedJoins)) {
      // TODO
    }

    // if soft deleted is enabled add where statement to filter deleted records
    // Not available with Mikro-ORM

    /* istanbul ignore else */
    if (many) {
      // set sort (order by)
      const sort = this.getSort(parsed, options.query);
      builder.orderBy(sort);

      // set take
      const take = this.getTake(parsed, options.query);
      /* istanbul ignore else */
      if (isFinite(take)) {
        builder.limit(take);
      }

      // set skip
      const skip = this.getSkip(parsed, take);
      /* istanbul ignore else */
      if (isFinite(skip)) {
        builder.offset(skip);
      }
    }

    // set cache
    /* istanbul ignore else */
    if (options.query.cache && parsed.cache !== 0) {
      builder.cache(options.query.cache);
    }

    return builder;
  }

  protected getSelect(query: ParsedRequestParams, options: QueryOptions): string[] {
    const allowed = this.getAllowedColumns(this.entityColumns, options);

    const columns =
      query.fields && query.fields.length
        ? query.fields.filter((field) => allowed.some((col) => field === col))
        : allowed;

    const select = new Set(
      [
        ...(options.persist && options.persist.length ? options.persist : []),
        ...columns,
        ...this.entityPrimaryColumns,
      ].map((col) => `${ this.alias }.${ col }`),
    );

    return Array.from(select);
  }

  protected getAllowedColumns(columns: string[], options: QueryOptions): string[] {
    return (!options.exclude || !options.exclude.length) &&
    (!options.allow || /* istanbul ignore next */ !options.allow.length)
      ? columns
      : columns.filter(
        (column) =>
          (options.exclude && options.exclude.length
            ? !options.exclude.some((col) => col === column)
            : /* istanbul ignore next */ true) &&
          (options.allow && options.allow.length
            ? options.allow.some((col) => col === column)
            : /* istanbul ignore next */ true),
      );
  }

  protected async getOneOrFail(req: CrudRequest, shallow = false, withDeleted = false): Promise<T> {
    const { parsed, options } = req;
    const builder = shallow
      ? this.repo.createQueryBuilder(this.alias)
      : this.createBuilder(parsed, options, true, withDeleted);

    if (shallow) {
      console.log(parsed.search);
      // this.setSearchCondition(builder, parsed.search);
    }

    const found = await builder.getSingleResult();

    if (!found) {
      this.throwNotFoundException(this.entityName);
    }

    return found;
  }

  /**
   * depends on paging call `QueryBuilder#getMany` or `QueryBuilder#getManyAndCount`
   * helpful for overriding `TypeOrmCrudService#getMany`
   * @see getMany
   * @see QueryBuilder#getResultList
   * @see QueryBuilder#getResultAndCount
   * @param builder
   * @param query
   * @param options
   */
  protected async doGetMany(
    builder: QueryBuilder<T>,
    query: ParsedRequestParams,
    options: CrudRequestOptions,
  ): Promise<GetManyDefaultResponse<T> | T[]> {
    if (this.decidePagination(query, options)) {
      const [data, total] = await builder.getResultAndCount();
      const limit = (builder as any)._limit;
      const offset = (builder as any)._offset;

      return this.createPageInfo(data, total, limit || total, offset || 0);
    }

    return builder.getResultList();
  }

  protected onInitMapEntityColumns(): void {
    this.entityColumns = this.metadata.props.map(({ name }) => name);
    this.entityPrimaryColumns = this.metadata.getPrimaryProps().map(({ name }) => name);
    // Feature not available with MikroORM. See https://github.com/mikro-orm/mikro-orm/issues/385
    this.entityHasDeleteColumn = false;
  }

  protected getSort(query: ParsedRequestParams, options: QueryOptions): ObjectLiteral {
    return query.sort && query.sort.length
      ? this.mapSort(query.sort)
      : options.sort && options.sort.length
        ? this.mapSort(options.sort)
        : {};
  }

  protected getFieldWithAlias(field: string, sort = false): string {
    /* istanbul ignore next */
    const i = ['mysql', 'mariadb'].includes(this.dbName) ? '`' : '"';
    const cols = field.split('.');

    switch (cols.length) {
      case 1:
        if (sort) {
          return `${ this.alias }.${ field }`;
        }

        const dbColName = this.entityColumnsHash[field] !== field ? this.entityColumnsHash[field] : field;

        return `${ i }${ this.alias }${ i }.${ i }${ dbColName }${ i }`;
      case 2:
        return field;
      default:
        return cols.slice(cols.length - 2, cols.length).join('.');
    }
  }

  protected mapSort(sort: QuerySort[]): ObjectLiteral {
    const params: ObjectLiteral = {};

    for (let i = 0; i < sort.length; i++) {
      const field = this.getFieldWithAlias(sort[i].field, true);
      const checkedFiled = this.checkSqlInjection(field);
      params[checkedFiled] = sort[i].order;
    }

    return params;
  }

  private checkSqlInjection(field: string): string {
    /* istanbul ignore else */
    if (this.sqlInjectionRegEx.length) {
      for (let i = 0; i < this.sqlInjectionRegEx.length; i++) {
        /* istanbul ignore else */
        if (this.sqlInjectionRegEx[0].test(field)) {
          this.throwBadRequestException(`SQL injection detected: "${ field }"`);
        }
      }
    }

    return field;
  }
}
