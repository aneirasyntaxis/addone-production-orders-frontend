// Data - Company Mapper
import { Company } from '../../domain/entities/company.entity';
import { CompanyDto } from '../dtos/company.dto';

export class CompanyMapper {
  static toDomain(dto: CompanyDto): Company {
    return {
      name: dto.name,
      code: dto.code,
    };
  }

  static toDomainList(dtos: CompanyDto[]): Company[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
