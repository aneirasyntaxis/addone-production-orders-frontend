// Data - Profit Center Mapper
import { ProfitCenter } from '../../domain/entities/profit-center.entity';
import { ProfitCenterDto } from '../dtos/profit-center.dto';

export class ProfitCenterMapper {
  static toDomain(dto: ProfitCenterDto): ProfitCenter {
    return {
      centerCode: dto.centerCode,
      centerName: dto.centerName,
      inWhichDimension: dto.inWhichDimension,
      active: dto.active,
    };
  }

  static toDomainList(dtos: ProfitCenterDto[]): ProfitCenter[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
