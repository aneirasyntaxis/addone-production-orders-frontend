// Data - Batch Repository Implementation
import { BatchRepository } from '../../domain/repositories/batch.repository';
import { Batch } from '../../domain/entities/batch.entity';
import { batchApi } from '../api/batch.api';
import { BatchMapper } from '../mappers/batch.mapper';

export class BatchRepositoryImpl implements BatchRepository {
  async getBatchesByItemAndWarehouse(itemCode: string, whsCode: string): Promise<Batch[]> {
    const dtos = await batchApi.getBatchesByItemAndWarehouse(itemCode, whsCode);
    return BatchMapper.toDomainList(dtos);
  }
}

export const batchRepository = new BatchRepositoryImpl();
