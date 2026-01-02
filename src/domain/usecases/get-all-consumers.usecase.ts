// Domain - Get All Consumers Use Case
import { Consumer } from '../entities/consumer.entity';
import { IConsumerRepository } from '../repositories/consumer.repository.interface';

export class GetAllConsumersUseCase {
  constructor(private consumerRepository: IConsumerRepository) {}

  async execute(docNumber?: number): Promise<Consumer[]> {
    return await this.consumerRepository.getAll(docNumber);
  }
}
