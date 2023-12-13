import { EntityRepository } from '@mikro-orm/core';
import { RequiredEntityData } from '@mikro-orm/core/typings';
import { QueryBuilder } from '@mikro-orm/knex';
import { NotImplementedException } from '@nestjs/common/exceptions/not-implemented.exception';
import { CreateManyDto, CrudRequest, CrudRequestOptions, GetManyDefaultResponse } from '@nestjsx/crud';
import { ParsedRequestParams } from '@nestjsx/crud-request';
import { hasLength, isArrayFull, isNil, isObject, isUndefined, objKeys } from '@nestjsx/util';
import { oO } from '@zmotivat0r/o0';
import { plainToClass } from 'class-transformer';
import { AbstractCrudService } from './abstract-crud.service';

// eslint-disable-next-line @typescript-eslint/ban-types
export class MikroOrmCrudService<T extends object> extends AbstractCrudService<T> {
  /**
   * Bind findOne method from entity repository
   */
  public get findOne(): EntityRepository<T>['findOne'] {
    return this.repo.findOne.bind(this.repo);
  }

  /**
   * Bind find method from entity repository
   */
  public get find(): EntityRepository<T>['find'] {
    return this.repo.find.bind(this.repo);
  }

  /**
   * Bind count method from entity repository
   */
  public get count(): EntityRepository<T>['count'] {
    return this.repo.count.bind(this.repo);
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
    const entity = this.repo.create<T>(dto as RequiredEntityData<T>);

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

    const bulk = dto.bulk.map((one) => this.prepareEntityBeforeSave(one, req.parsed)).filter((d) => !isUndefined(d));

    /* istanbul ignore if */
    if (!hasLength(bulk)) {
      this.throwBadRequestException('Empty data. Nothing to save.');
    }

    await this.em.persistAndFlush(bulk);

    return bulk;
  }

  /**
   * Update one
   * @param req
   * @param dto
   */
  public async updateOne(req: CrudRequest, dto: T | Partial<T>): Promise<T> {
    const { allowParamsOverride, returnShallow } = req.options.routes.updateOneBase;
    const paramsFilters = this.getParamFilters(req.parsed);
    const found = await this.getOneOrFail(req, returnShallow);
    const toSave = !allowParamsOverride
      ? { ...found, ...dto, ...paramsFilters, ...req.parsed.authPersist }
      : { ...found, ...dto, ...req.parsed.authPersist };

    const entity = plainToClass(this.entityType, toSave, req.parsed.classTransformOptions);
    this.em.persist(entity);

    if (returnShallow) {
      return entity;
    } else {
      req.parsed.paramsFilter.forEach((filter) => {
        filter.value = entity[filter.field];
      });

      return this.getOneOrFail(req);
    }
  }

  /**
   * Replace one
   * @param req
   * @param dto
   */
  public async replaceOne(req: CrudRequest, dto: T | Partial<T>): Promise<T> {
    const { allowParamsOverride, returnShallow } = req.options.routes.replaceOneBase;
    const paramsFilters = this.getParamFilters(req.parsed);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, found] = await oO(this.getOneOrFail(req, returnShallow));
    const toSave = !allowParamsOverride
      ? { ...(found || {}), ...dto, ...paramsFilters, ...req.parsed.authPersist }
      : {
        ...(found || /* istanbul ignore next */ {}),
        ...paramsFilters,
        ...dto,
        ...req.parsed.authPersist,
      };
    const entity = plainToClass(this.entityType, toSave, req.parsed.classTransformOptions);
    this.em.persist(entity);

    if (returnShallow) {
      return entity;
    } else {
      const primaryParams = this.getPrimaryParams(req.options);

      /* istanbul ignore if */
      if (!primaryParams.length) {
        return entity;
      }

      req.parsed.search = primaryParams.reduce((acc, p) => ({ ...acc, [p]: entity[p] }), {});
      return this.getOneOrFail(req);
    }
  }

  /**
   * Delete one
   * @param req
   */
  public async deleteOne(req: CrudRequest): Promise<void | T> {
    const { returnDeleted } = req.options.routes.deleteOneBase;
    const found = await this.getOneOrFail(req, returnDeleted);
    const toReturn = returnDeleted
      ? plainToClass(this.entityType, { ...found }, req.parsed.classTransformOptions)
      : undefined;

    await this.em.removeAndFlush(found);

    return toReturn;
  }

  /**
   * Recover one
   */
  public async recoverOne(): Promise<void | T> {
    throw new NotImplementedException('Not available natively with Mikro-ORM');
  }

  /**
   * Create MikroOrm QueryBuilder
   * @param parsed
   * @param options
   * @param many
   */
  public createBuilder(
    parsed: ParsedRequestParams,
    options: CrudRequestOptions,
    many = true,
  ): QueryBuilder<T> {
    // create query builder
    const builder = this.em.createQueryBuilder<T>(this.entityName, this.alias);
    // get select fields
    const select = this.getSelect(parsed, options.query);
    // select fields
    builder.select(select);

    // search
    this.setSearchCondition(builder, parsed.search);

    // set joins
    const joinOptions = options.query.join || {};
    const allowedJoins = objKeys(joinOptions);

    if (hasLength(allowedJoins)) {
      const eagerJoins: any = {};

      for (let i = 0; i < allowedJoins.length; i++) {
        /* istanbul ignore else */
        if (joinOptions[allowedJoins[i]].eager) {
          const cond = parsed.join.find((j) => j && j.field === allowedJoins[i]) || {
            field: allowedJoins[i],
          };
          this.setJoin(cond, joinOptions, builder);
          eagerJoins[allowedJoins[i]] = true;
        }
      }

      if (isArrayFull(parsed.join)) {
        for (let i = 0; i < parsed.join.length; i++) {
          /* istanbul ignore else */
          if (!eagerJoins[parsed.join[i].field]) {
            this.setJoin(parsed.join[i], joinOptions, builder);
          }
        }
      }
    }

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

  // eslint-disable-next-line @typescript-eslint/ban-types
  public getParamFilters(parsed: CrudRequest['parsed']): object {
    const filters = {};

    /* istanbul ignore else */
    if (hasLength(parsed.paramsFilter)) {
      for (const filter of parsed.paramsFilter) {
        filters[filter.field] = filter.value;
      }
    }

    return filters;
  }

  /**
   * Get one item or throw and exception
   * @param req
   * @param shallow
   * @protected
   */
  protected async getOneOrFail(req: CrudRequest, shallow = false): Promise<T> {
    const { parsed, options } = req;
    const builder = shallow
      ? this.repo.createQueryBuilder(this.alias)
      : this.createBuilder(parsed, options, true);

    if (shallow) {
      this.setSearchCondition(builder, parsed.search);
    }

    const found = await builder.getSingleResult();

    if (!found) {
      this.throwNotFoundException(this.entityName);
    }

    return found;
  }
}
