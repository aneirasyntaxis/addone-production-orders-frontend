// Data - Warehouse DTO
export interface WarehouseDto {
  warehouseCode: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  message?: string;
}
