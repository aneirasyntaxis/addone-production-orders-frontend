// Domain - Item Repository Interface
import { Item } from '../entities/item.entity';

export interface IItemRepository {
  getByName(name: string): Promise<Item[]>;
}
