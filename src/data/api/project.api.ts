// Data - Project API
import { apiClient } from './api-client';
import { ProjectDto, ApiResponse } from '../dtos/project.dto';

export class ProjectApi {
  async search(keyword: string): Promise<ProjectDto[]> {
    const response = await apiClient.get<ApiResponse<ProjectDto[]>>(`/projects?keyword=${encodeURIComponent(keyword)}`);
    
    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al buscar proyectos');
    }

    return response.data;
  }
}

export const projectApi = new ProjectApi();
