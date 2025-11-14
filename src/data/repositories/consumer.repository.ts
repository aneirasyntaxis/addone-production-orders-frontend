// Data - Consumer Repository Implementation
import { Consumer, CreateConsumer } from '../../domain/entities/consumer.entity';
import { IConsumerRepository } from '../../domain/repositories/consumer.repository.interface';
import { consumerApi } from '../api/consumer.api';
import { ConsumerMapper } from '../mappers/consumer.mapper';

export class ConsumerRepository implements IConsumerRepository {
  async getAll(): Promise<Consumer[]> {
    const dtos = await consumerApi.getAll();
    return ConsumerMapper.toDomainList(dtos);
  }

  async getById(id: number): Promise<Consumer> {
    const dto = await consumerApi.getById(id);
    return ConsumerMapper.toDomain(dto);
  }

  async getByDocNumber(docNumber: number): Promise<Consumer> {
    const dto = await consumerApi.getByDocNumber(docNumber);
    return ConsumerMapper.toDomain(dto);
  }

  async getByOT(ot: string): Promise<Consumer[]> {
    const dtos = await consumerApi.getByOT(ot);
    return ConsumerMapper.toDomainList(dtos);
  }

  async getByDateRange(fromDate: string, toDate: string): Promise<Consumer[]> {
    const dtos = await consumerApi.getByDateRange(fromDate, toDate);
    return ConsumerMapper.toDomainList(dtos);
  }

  async create(consumer: CreateConsumer): Promise<Consumer> {
    const dto = ConsumerMapper.toDto(consumer);
    const result = await consumerApi.create(dto);
    return ConsumerMapper.toDomain(result);
  }

  async update(id: number, consumer: CreateConsumer): Promise<Consumer> {
    const dto = ConsumerMapper.toDto(consumer);
    const result = await consumerApi.update(id, dto);
    return ConsumerMapper.toDomain(result);
  }

  async delete(id: number): Promise<boolean> {
    return await consumerApi.delete(id);
  }
}

export const consumerRepository = new ConsumerRepository();
