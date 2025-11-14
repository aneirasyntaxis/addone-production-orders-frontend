// Data - Company Repository Implementation
import { Company } from '../../domain/entities/company.entity';
import { ICompanyRepository } from '../../domain/repositories/company.repository.interface';
import { companyApi } from '../api/company.api';
import { CompanyMapper } from '../mappers/company.mapper';

export class CompanyRepository implements ICompanyRepository {
  async getAll(): Promise<Company[]> {
    const dtos = await companyApi.getAll();
    return CompanyMapper.toDomainList(dtos);
  }
}

export const companyRepository = new CompanyRepository();
