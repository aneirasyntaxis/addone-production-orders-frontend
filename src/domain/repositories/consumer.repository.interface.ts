// Domain - Consumer Repository Interface
import { Consumer, CreateConsumer } from '../entities/consumer.entity';

export interface IConsumerRepository {
  getAll(docNumber?: number): Promise<Consumer[]>;
  getById(id: number): Promise<Consumer>;
  getByDocNumber(docNumber: number): Promise<Consumer>;
  getByProductionOrderId(productionOrderId: number): Promise<Consumer[]>;
  getByOT(ot: string): Promise<Consumer[]>;
  getByDateRange(fromDate: string, toDate: string): Promise<Consumer[]>;
  create(consumer: CreateConsumer): Promise<Consumer>;
  update(id: number, consumer: CreateConsumer): Promise<Consumer>;
  delete(id: number): Promise<boolean>;
}
