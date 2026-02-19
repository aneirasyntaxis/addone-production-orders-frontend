// Data - Item DTOs

export interface ItemWarehouseInfoDto {
  minimalStock?: number;
  maximalStock?: number;
  minimalOrder?: number;
  warehouseCode?: string;
  inStock?: number;
  committed?: number;
  ordered?: number;
  countedQuantity?: number;
}

export interface ItemDto {
  itemCode: string;
  itemName?: string;
  itemsGroupCode?: number;
  foreignName?: string;
  valid: boolean;
  manageBatchNumbers: boolean;
  itemWarehouseInfoCollection: ItemWarehouseInfoDto[];
}
