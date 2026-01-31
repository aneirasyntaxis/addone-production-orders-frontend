// Data - Project Mapper
import { Project } from '../../domain/entities/project.entity';
import { ProjectDto } from '../dtos/project.dto';

export class ProjectMapper {
  static toDomain(dto: ProjectDto): Project {
    return {
      code: dto.code,
      name: dto.name,
      active: dto.active,
    };
  }

  static toDomainList(dtos: ProjectDto[]): Project[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
