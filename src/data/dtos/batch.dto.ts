// Data - Batch DTO
export interface BatchDto {
  batchNum: string;
  itemCode: string;
  quantity: number;
  whsCode: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  message?: string;
}
