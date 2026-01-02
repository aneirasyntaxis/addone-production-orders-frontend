// Domain - Create Consumer Use Case
import { Consumer, CreateConsumer } from '../entities/consumer.entity';
import { IConsumerRepository } from '../repositories/consumer.repository.interface';

export class CreateConsumerUseCase {
  constructor(private consumerRepository: IConsumerRepository) {}

  async execute(consumer: CreateConsumer): Promise<Consumer> {
    return await this.consumerRepository.create(consumer);
  }
}
