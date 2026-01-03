// Presentation - useCompanies Hook
import { useQuery } from '@tanstack/react-query';
import { GetAllCompaniesUseCase } from '../../domain/usecases/get-all-companies.usecase';
import { companyRepository } from '../../data/repositories/company.repository';

const getAllCompaniesUseCase = new GetAllCompaniesUseCase(companyRepository);

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => getAllCompaniesUseCase.execute(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
