// Domain - Get Consumer By ID Use Case
import { IConsumerRepository } from '../repositories/consumer.repository.interface';
import { Consumer } from '../entities/consumer.entity';

export class GetConsumerByIdUseCase {
  constructor(private repository: IConsumerRepository) {}

  async execute(id: number): Promise<Consumer> {
    return await this.repository.getById(id);
  }
}
