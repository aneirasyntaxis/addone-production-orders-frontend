// Domain - Item Entity
export interface ItemWarehouseInfo {
  minimalStock: number;
  maximalStock: number;
  minimalOrder: number;
  warehouseCode?: string;
  inStock: number;
  committed: number;
  ordered: number;
  countedQuantity: number;
}

export interface Item {
  itemCode: string;
  itemName?: string;
  itemsGroupCode?: number;
  foreignName?: string;
  valid: boolean;
  manageBatchNumbers: boolean;
  itemWarehouseInfoCollection: ItemWarehouseInfo[];
}
