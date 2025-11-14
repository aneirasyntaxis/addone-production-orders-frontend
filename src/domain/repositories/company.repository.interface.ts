// Domain - Company Repository Interface
import { Company } from '../entities/company.entity';

export interface ICompanyRepository {
  getAll(): Promise<Company[]>;
}
