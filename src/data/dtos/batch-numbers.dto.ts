// Data - Batch Numbers DTO
export interface BatchNumbersDto {
  batchNumber?: string;
  quantity?: number;
  baseLineNumber?: number;
  itemCode?: string;
}

export interface CreateBatchNumbersDto {
  BatchNumber?: string;
  Quantity?: number;
  BaseLineNumber?: number;
  ItemCode?: string;
}
