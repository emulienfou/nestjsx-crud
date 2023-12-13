import { Constructor, EntityMetadata, GroupOperator, type QBFilterQuery } from '@mikro-orm/core';
import { QueryBuilder } from '@mikro-orm/knex';
import { EntityManager as MariaDbEntityManager, EntityRepository as MariaDbEntityRepository } from '@mikro-orm/mariadb';
import { EntityManager as MySQLEntityManager, EntityRepository as MySQLEntityRepository } from '@mikro-orm/mysql';
import {
  EntityManager as PostgreSQLEntityManager,
  EntityRepository as PostgreSQLEntityRepository,
} from '@mikro-orm/postgresql';
import { EntityManager as SqliteEntityManager, EntityRepository as SqliteEntityRepository } from '@mikro-orm/sqlite';
import { NotImplementedException } from '@nestjs/common';
import {
  CrudRequest,
  CrudRequestOptions,
  CrudService,
  GetManyDefaultResponse,
  JoinOption,
  JoinOptions,
  QueryOptions,
} from '@nestjsx/crud';
import {
  ComparisonOperator,
  CondOperator,
  ParsedRequestParams,
  QueryFilter,
  QueryJoin,
  QuerySort,
  SCondition,
} from '@nestjsx/crud-request';
import { hasLength, isArrayFull, isNil, isNull, isObject, ObjectLiteral, objKeys } from '@nestjsx/util';

interface IAllowedRelation {
  alias?: string;
  nested: boolean;
  name: string;
  path: string;
  columns: string[];
  primaryColumns: string[];
  allowedColumns: string[];
}

enum DriverName {
  POSTGRESQL = 'PostgreSqlDriver',
  MYSQL = 'MySqlDriver',
  MARIADB = 'MariaDbDriver',
  SQLITE = 'SqliteDriver',
}

// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class AbstractCrudService<T extends object> extends CrudService<T> {
  protected driverName: DriverName;

  protected dbName: string;

  protected entityColumns: string[];

  protected entityPrimaryColumns: string[];

  protected entityHasDeleteColumn = false;

  protected entityColumnsHash: ObjectLiteral = {};

  protected entityRelationsHash: Map<string, IAllowedRelation> = new Map();

  protected sqlInjectionRegEx: RegExp[] = [
    /(%27)|(')|(--)|(%23)|(#)/gi,
    /((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))/gi,
    /w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))/gi,
    /((%27)|('))union/gi,
  ];

  protected readonly em: MariaDbEntityManager | MySQLEntityManager | PostgreSQLEntityManager | SqliteEntityManager;

  protected readonly metadata: EntityMetadata<T>;

  constructor(
    protected repo:
      | MariaDbEntityRepository<T>
      | MySQLEntityRepository<T>
      | PostgreSQLEntityRepository<T>
      | SqliteEntityRepository<T>,
  ) {
    super();

    this.em = repo.getEntityManager();
    this.metadata = this.em.getMetadata(repo.getEntityName());
    this.dbName = this.metadata.name;
    this.driverName = this.em.getDriver().constructor.name as DriverName;
    this.onInitMapEntityColumns();
  }

  /**
   * Get Entity class instance
   * @protected
   */
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
   * depends on paging call `QueryBuilder#getMany` or `QueryBuilder#getManyAndCount`
   * helpful for overriding `MikroOrmCrudService#getMany`
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

  /**
   * Initial entity columns arrays
   * @protected
   */
  protected onInitMapEntityColumns(): void {
    this.entityColumns = this.metadata.props.map((prop) => {
      // In case column is an embedded, use the propertyPath to get complete path
      if (prop.targetMeta) {
        this.entityColumnsHash[prop.targetMeta.name] = `${prop.name}.${prop.targetMeta.collection}`;
        return prop.targetMeta.collection;
      }
      this.entityColumnsHash[prop.name] = prop.fieldNames[0] ?? prop.name;

      return prop.name;
    });
    this.entityPrimaryColumns = this.metadata.getPrimaryProps().map(({ name }) => name);
    // Feature not available with MikroORM. See https://github.com/mikro-orm/mikro-orm/issues/385
    this.entityHasDeleteColumn = false;
  }

  /**
   * Get select columns from entity
   * @param query
   * @param options
   * @protected
   */
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
      ].map((col) => `${this.alias}.${col}`),
    );

    return Array.from(select);
  }

  /**
   * Get allowed entity columns
   * @param columns
   * @param options
   * @protected
   */
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

  /**
   * Get sort parameters
   * @param query
   * @param options
   * @protected
   */
  protected getSort(query: ParsedRequestParams, options: QueryOptions): ObjectLiteral {
    return query.sort && query.sort.length
      ? this.mapSort(query.sort)
      : options.sort && options.sort.length
      ? this.mapSort(options.sort)
      : {};
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

  protected mapOperatorsToQuery(filter: QueryFilter): QBFilterQuery<T> {
    const { field, value } = filter;
    let { operator } = filter;
    const fieldAlias = this.getFieldWithAlias(field);

    if (operator[0] !== '$') {
      operator = ('$' + operator) as ComparisonOperator;
    }

    switch (operator) {
      case CondOperator.EQUALS:
        return { [fieldAlias]: { $eq: value } };

      case CondOperator.NOT_EQUALS:
        return { [fieldAlias]: { $ne: value } };

      case CondOperator.GREATER_THAN:
        return { [fieldAlias]: { $gt: value } };

      case CondOperator.LOWER_THAN:
        return { [fieldAlias]: { $lt: value } };

      case CondOperator.GREATER_THAN_EQUALS:
        return { [fieldAlias]: { $gte: value } };

      case CondOperator.LOWER_THAN_EQUALS:
        return { [fieldAlias]: { $lte: value } };

      case CondOperator.IN:
        this.checkFilterIsArray({ field, value, operator });
        return { [fieldAlias]: { $in: value } };

      case CondOperator.NOT_IN:
        this.checkFilterIsArray({ field, value, operator });
        return { [fieldAlias]: { $nin: value } };

      case CondOperator.IS_NULL:
        return { [fieldAlias]: { $eq: null } };

      case CondOperator.NOT_NULL:
        return { [fieldAlias]: { $exists: true } };

      case CondOperator.CONTAINS:
        return { [fieldAlias]: { $contains: value } };

      /* istanbul ignore next */
      default:
        throw new NotImplementedException('Not supported operator by Mikro-ORM');
    }
  }

  protected getFieldWithAlias(field: string, sort = false): string {
    /* istanbul ignore next */
    const i = [DriverName.MYSQL, DriverName.MARIADB].includes(this.driverName) ? '`' : '"';
    const cols = field.split('.');

    switch (cols.length) {
      case 1:
        if (sort) {
          return `${this.alias}.${field}`;
        }

        const dbColName = this.entityColumnsHash[field] !== field ? this.entityColumnsHash[field] : field;

        return `${i}${this.alias}${i}.${i}${dbColName}${i}`;
      case 2:
        return field;
      default:
        return cols.slice(cols.length - 2, cols.length).join('.');
    }
  }

  protected setSearchCondition(
    builder: QueryBuilder<T>,
    search: SCondition,
    operator: GroupOperator = GroupOperator.$and,
  ): void {
    /* istanbul ignore else */
    if (isObject(search)) {
      const keys = objKeys(search);
      /* istanbul ignore else */
      if (keys.length) {
        // search: {$and: [...], ...}
        if (isArrayFull(search.$and)) {
          // search: {$and: [{}]}
          if (search.$and.length === 1) {
            this.setSearchCondition(builder, search.$and[0], operator);
          }
          // search: {$and: [{}, {}, ...]}
          else {
            this.builderAddBrackets(builder, GroupOperator.$and, search.$and);
          }
        }
        // search: {$or: [...], ...}
        else if (isArrayFull(search.$or)) {
          // search: {$or: [...]}
          if (keys.length === 1) {
            // search: {$or: [{}]}
            if (search.$or.length === 1) {
              this.setSearchCondition(builder, search.$or[0], operator);
            }
            // search: {$or: [{}, {}, ...]}
            else {
              this.builderAddBrackets(builder, GroupOperator.$or, search.$or);
            }
          }
          // search: {$or: [...], foo, ...}
          else {
            console.log('NOT IMPLEMENTED', 'search: {$or: [...], foo, ...}', keys);
            // this.builderAddBrackets(
            //   builder,
            //   condition,
            //   new Brackets((qb: any) => {
            //     keys.forEach((field: string) => {
            //       if (field !== GroupOperator.$or) {
            //         const value = search[field];
            //         if (!isObject(value)) {
            //           this.builderSetWhere(qb, GroupOperator.$and, field, value);
            //         } else {
            //           this.setSearchFieldObjectCondition(qb, GroupOperator.$and, field, value);
            //         }
            //       } else {
            //         if (search.$or.length === 1) {
            //           this.setSearchCondition(builder, search.$or[0], GroupOperator.$and);
            //         } else {
            //           this.builderAddBrackets(
            //             qb,
            //             GroupOperator.$and,
            //             new Brackets((qb2: any) => {
            //               search.$or.forEach((item: any) => {
            //                 this.setSearchCondition(qb2, item, GroupOperator.$or);
            //               });
            //             }),
            //           );
            //         }
            //       }
            //     });
            //   }),
            // );
          }
        }
        // search: {...}
        else {
          // search: {foo}
          if (keys.length === 1) {
            const field = keys[0];
            const value = search[field];
            if (!isObject(value)) {
              this.builderSetWhere(builder, operator, field, value);
            } else {
              this.setSearchFieldObjectCondition(builder, operator, field, value);
            }
          }
          // search: {foo, ...}
          else {
            console.log('NOT IMPLEMENTED', 'search: {foo, ...}', keys);
            // this.builderAddBrackets(
            //   builder,
            //   condition,
            //   new Brackets((qb: any) => {
            //     keys.forEach((field: string) => {
            //       const value = search[field];
            //       if (!isObject(value)) {
            //         this.builderSetWhere(qb, GroupOperator.$and, field, value);
            //       } else {
            //         this.setSearchFieldObjectCondition(qb, GroupOperator.$and, field, value);
            //       }
            //     });
            //   }),
            // );
          }
        }
      }
    }
  }

  protected getEntityColumns(entityMetadata: EntityMetadata): { columns: string[]; primaryColumns: string[] } {
    const columns = entityMetadata.props.map(({ name }) => name) || /* istanbul ignore next */ [];
    const primaryColumns = entityMetadata.getPrimaryProps().map(({ name }) => name) || /* istanbul ignore next */ [];

    return { columns, primaryColumns };
  }

  protected getRelationMetadata(field: string, options: JoinOption): IAllowedRelation {
    try {
      let allowedRelation;
      let nested = false;

      if (this.entityRelationsHash.has(field)) {
        allowedRelation = this.entityRelationsHash.get(field);
      } else {
        const fields = field.split('.');
        let relationMetadata: EntityMetadata;
        let name: string;
        let path: string;
        let parentPath: string;

        if (fields.length === 1) {
          const found = this.metadata.relations.find(({ name }) => name === fields[0]);

          if (found) {
            name = fields[0];
            path = `${this.alias}.${fields[0]}`;
            relationMetadata = found.targetMeta;
          }
        } else {
          nested = true;
          parentPath = '';

          const reduced = fields.reduce(
            (res, propertyName: string, i) => {
              const found = res.relations.length ? res.relations.find(({ name }) => name === propertyName) : null;
              const relationMetadata = found ? found.targetMeta : null;
              const relations = relationMetadata ? relationMetadata.relations : [];
              name = propertyName;

              if (i !== fields.length - 1) {
                parentPath = !parentPath ? propertyName : /* istanbul ignore next */ `${parentPath}.${propertyName}`;
              }

              return {
                relations,
                relationMetadata,
              };
            },
            {
              relations: this.metadata.relations,
              relationMetadata: null,
            },
          );

          relationMetadata = reduced.relationMetadata;
        }

        if (relationMetadata) {
          const { columns, primaryColumns } = this.getEntityColumns(relationMetadata);

          if (!path && parentPath) {
            const parentAllowedRelation = this.entityRelationsHash.get(parentPath);

            /* istanbul ignore next */
            if (parentAllowedRelation) {
              path = parentAllowedRelation.alias ? `${parentAllowedRelation.alias}.${name}` : field;
            }
          }

          allowedRelation = {
            alias: options.alias,
            name,
            path,
            columns,
            nested,
            primaryColumns,
          };
        }
      }

      if (allowedRelation) {
        const allowedColumns = this.getAllowedColumns(allowedRelation.columns, options);
        const toSave: IAllowedRelation = { ...allowedRelation, allowedColumns };

        this.entityRelationsHash.set(field, toSave);

        if (options.alias) {
          this.entityRelationsHash.set(options.alias, toSave);
        }

        return toSave;
      }
    } catch (_) {
      /* istanbul ignore next */
      return null;
    }
  }

  protected setJoin(cond: QueryJoin, joinOptions: JoinOptions, builder: QueryBuilder<T>): boolean {
    const options = joinOptions[cond.field];

    if (!options) {
      return true;
    }

    const allowedRelation = this.getRelationMetadata(cond.field, options);

    if (!allowedRelation) {
      return true;
    }

    const relationType = options.required ? 'innerJoin' : 'leftJoin';
    const alias = options.alias ? options.alias : allowedRelation.name;

    builder[relationType](allowedRelation.path, alias);

    if (options.select !== false) {
      const columns = isArrayFull(cond.select)
        ? cond.select.filter((column) => allowedRelation.allowedColumns.some((allowed) => allowed === column))
        : allowedRelation.allowedColumns;

      const select = new Set(
        [...allowedRelation.primaryColumns, ...(isArrayFull(options.persist) ? options.persist : []), ...columns].map(
          (col) => `${alias}.${col}`,
        ),
      );

      builder.addSelect(Array.from(select));
    }
  }

  protected builderAddBrackets(builder: QueryBuilder<T>, operator: GroupOperator, filter: QBFilterQuery<T>): void {
    if (operator === GroupOperator.$and) {
      builder.andWhere(filter);
    } else {
      builder.orWhere(filter);
    }
  }

  protected setAndWhere(filter: QueryFilter, builder: QueryBuilder<T>): void {
    builder.andWhere(this.mapOperatorsToQuery(filter));
  }

  protected setOrWhere(filter: QueryFilter, builder: QueryBuilder<T>): void {
    builder.orWhere(this.mapOperatorsToQuery(filter));
  }

  protected builderSetWhere(
    builder: QueryBuilder<T>,
    condition: GroupOperator,
    field: string,
    value: any,
    operator: ComparisonOperator = CondOperator.EQUALS,
  ): void {
    const args = [{ field, operator: isNull(value) ? '$isnull' : operator, value }, builder];
    const fn = condition === GroupOperator.$and ? this.setAndWhere : this.setOrWhere;
    fn.apply(this, args);
  }

  protected setSearchFieldObjectCondition(
    builder: QueryBuilder<T>,
    condition: GroupOperator,
    field: string,
    object: any,
  ): void {
    /* istanbul ignore else */
    if (isObject(object)) {
      const operators = objKeys(object);

      if (operators.length === 1) {
        const operator = operators[0] as ComparisonOperator;
        const value = object[operator];

        if (isObject(object.$or)) {
          const orKeys = objKeys(object.$or);
          this.setSearchFieldObjectCondition(
            builder,
            orKeys.length === 1 ? condition : GroupOperator.$or,
            field,
            object.$or,
          );
        } else {
          this.builderSetWhere(builder, condition, field, value, operator);
        }
      } else {
        /* istanbul ignore else */
        if (operators.length > 1) {
          // this.builderAddBrackets(
          //   builder,
          //   condition,
          //   new Brackets((qb: any) => {
          //     operators.forEach((operator: GroupOperator) => {
          //       const value = object[operator];
          //
          //       if (operator !== GroupOperator.$or) {
          //         this.builderSetWhere(qb, condition, field, value, operator);
          //       } else {
          //         const orKeys = objKeys(object.$or);
          //
          //         if (orKeys.length === 1) {
          //           this.setSearchFieldObjectCondition(qb, condition, field, object.$or);
          //         } else {
          //           this.builderAddBrackets(
          //             qb,
          //             condition,
          //             new Brackets((qb2: any) => {
          //               this.setSearchFieldObjectCondition(qb2, GroupOperator.$or, field, object.$or);
          //             }),
          //           );
          //         }
          //       }
          //     });
          //   }),
          // );
        }
      }
    }
  }

  protected prepareEntityBeforeSave(dto: T | Partial<T>, parsed: CrudRequest['parsed']): T {
    /* istanbul ignore if */
    if (!isObject(dto)) {
      return undefined;
    }

    if (hasLength(parsed.paramsFilter)) {
      for (const filter of parsed.paramsFilter) {
        dto[filter.field] = filter.value;
      }
    }

    /* istanbul ignore if */
    if (!hasLength(objKeys(dto))) {
      return undefined;
    }

    return this.em.create(this.entityName, dto as any);
  }

  private checkFilterIsArray(cond: QueryFilter, withLength?: boolean): void {
    /* istanbul ignore if */
    if (!Array.isArray(cond.value) || !cond.value.length || (!isNil(withLength) ? withLength : false)) {
      this.throwBadRequestException(`Invalid column '${cond.field}' value`);
    }
  }

  private checkSqlInjection(field: string): string {
    /* istanbul ignore else */
    if (this.sqlInjectionRegEx.length) {
      for (let i = 0; i < this.sqlInjectionRegEx.length; i++) {
        /* istanbul ignore else */
        if (this.sqlInjectionRegEx[0].test(field)) {
          this.throwBadRequestException(`SQL injection detected: "${field}"`);
        }
      }
    }

    return field;
  }
}
