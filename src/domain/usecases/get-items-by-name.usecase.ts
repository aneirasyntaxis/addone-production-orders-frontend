// Domain - Get Items By Name Use Case
import { IItemRepository } from '../repositories/item.repository';
import { Item } from '../entities/item.entity';
import { logger } from '../../core/logging/logger';

export class GetItemsByNameUseCase {
  constructor(private repository: IItemRepository) {}

  async execute(name: string): Promise<Item[]> {
    logger.debug('GetItemsByNameUseCase: Executing', { name });
    
    if (!name || name.trim().length < 3) {
      logger.debug('GetItemsByNameUseCase: Name too short', { length: name.length });
      return [];
    }

    const items = await this.repository.getByName(name.trim());
    
    logger.info('GetItemsByNameUseCase: Items retrieved', { count: items.length });
    return items;
  }
}
