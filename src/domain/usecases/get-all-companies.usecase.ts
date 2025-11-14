// Domain - Get All Companies Use Case
import { Company } from '../entities/company.entity';
import { ICompanyRepository } from '../repositories/company.repository.interface';

export class GetAllCompaniesUseCase {
  constructor(private companyRepository: ICompanyRepository) {}

  async execute(): Promise<Company[]> {
    return await this.companyRepository.getAll();
  }
}
