// Presentation - useCompanies Hook
import { useQuery } from '@tanstack/react-query';
import { GetAllCompaniesUseCase } from '../../domain/usecases/get-all-companies.usecase';
import { companyRepository } from '../../data/repositories/company.repository';
import { Company } from '../../domain/entities/company.entity';

const getAllCompaniesUseCase = new GetAllCompaniesUseCase(companyRepository);

// MOCK DATA - TEMPORAL PARA PRUEBAS
const mockCompanies: Company[] = [
  { name: 'Empresa Demo 1', code: 'DEMO1' },
  { name: 'Empresa Demo 2', code: 'DEMO2' },
  { name: 'Empresa de Prueba', code: 'TEST' },
];

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    // USANDO MOCK - network_security_config no funciona en Expo Go
    // Para probar con API real, hacer build con: eas build -p android --profile preview
    // queryFn: () => getAllCompaniesUseCase.execute(),
    queryFn: () => Promise.resolve(mockCompanies),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
