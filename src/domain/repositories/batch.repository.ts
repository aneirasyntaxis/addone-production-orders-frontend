// Domain - Batch Repository Interface
import { Batch } from '../entities/batch.entity';

export interface BatchRepository {
  getBatchesByItemAndWarehouse(itemCode: string, whsCode: string): Promise<Batch[]>;
}
