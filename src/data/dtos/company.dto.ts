// Data - Company DTOs
export interface CompanyDto {
  name: string;
  code: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
