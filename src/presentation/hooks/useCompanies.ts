// Presentation - useCompanies Hook
import { useQuery } from '@tanstack/react-query';
import { GetAllCompaniesUseCase } from '../../domain/usecases/get-all-companies.usecase';
import { companyRepository } from '../../data/repositories/company.repository';
import { logger } from '../../core/logging/logger';
import { API_CONFIG } from '../../core/constants/app.constants';

const getAllCompaniesUseCase = new GetAllCompaniesUseCase(companyRepository);

// Workaround: Inicializar la red con una llamada dummy
let networkInitialized = false;

const initializeNetwork = async () => {
  if (networkInitialized) return;
  
  try {
    logger.info('🌐 Step 1: Warming up network stack with Google...');
    await fetch("https://www.google.com", { method: "HEAD" });
    logger.info('✅ Step 1 completed');
  } catch (error) {
    logger.warn('⚠️ Step 1 failed (this is OK):', error);
  }
  
  try {
    const healthUrl = `${API_CONFIG.BASE_URL.replace('/api', '')}/health`;
    logger.info(`🌐 Step 2: Warming up connection to API server (${healthUrl})...`);
    await fetch(healthUrl, { method: "HEAD" });
    logger.info('✅ Step 2 completed - API server reachable');
  } catch (error) {
    logger.warn('⚠️ Step 2 failed (this is OK):', error);
  }
  
  networkInitialized = true;
  logger.info('✅ Network initialization complete');
};

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      // Inicializar la red antes de la primera llamada
      await initializeNetwork();
      return getAllCompaniesUseCase.execute();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
