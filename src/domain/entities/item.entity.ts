// Domain - Item Entity
export interface Item {
  itemCode: string;
  itemName?: string;
  itemsGroupCode?: number;
  foreignName?: string;
  valid: boolean;
}
