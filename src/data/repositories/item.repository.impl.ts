// Data - Item Repository Implementation
import { IItemRepository } from '../../domain/repositories/item.repository';
import { Item } from '../../domain/entities/item.entity';
import { itemApi } from '../api/item.api';
import { logger } from '../../core/logging/logger';

export class ItemRepositoryImpl implements IItemRepository {
  async getByName(name: string): Promise<Item[]> {
    try {
      logger.debug('ItemRepository: Fetching items by name', { name });
      
      const dtos = await itemApi.getByName(name);
      const items = dtos.map(this.mapToEntity);
      
      logger.info('ItemRepository: Items fetched successfully', { count: items.length });
      
      return items;
    } catch (error) {
      logger.error('ItemRepository: Error fetching items', error);
      throw error;
    }
  }

  private mapToEntity(dto: any): Item {
    return {
      itemCode: dto.itemCode,
      itemName: dto.itemName,
      itemsGroupCode: dto.itemsGroupCode,
      foreignName: dto.foreignName,
      valid: dto.valid,
    };
  }
}

// Export singleton instance
export const itemRepository = new ItemRepositoryImpl();
