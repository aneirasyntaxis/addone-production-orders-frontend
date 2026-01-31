// Data - Profit Center DTO
export interface ProfitCenterDto {
  centerCode: string;
  centerName?: string;
  inWhichDimension?: number;
  active: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  message?: string;
}
