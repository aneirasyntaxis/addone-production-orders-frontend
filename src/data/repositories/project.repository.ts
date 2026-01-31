// Data - Project Repository
import { Project } from '../../domain/entities/project.entity';
import { projectApi } from '../api/project.api';
import { ProjectMapper } from '../mappers/project.mapper';

export interface ProjectResult {
  isSuccess: boolean;
  data: Project[] | null;
  message?: string;
}

export class ProjectRepository {
  async search(keyword: string): Promise<Project[]> {
    const dtos = await projectApi.search(keyword);
    return ProjectMapper.toDomainList(dtos);
  }
}

export const projectRepository = new ProjectRepository();
