// Data - Project DTO
export interface ProjectDto {
  code: string;
  name?: string;
  active: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  message?: string;
}
