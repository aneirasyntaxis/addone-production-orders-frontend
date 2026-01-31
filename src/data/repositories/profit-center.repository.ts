// Data - Profit Center Repository Implementation
import { ProfitCenter } from '../../domain/entities/profit-center.entity';
import { profitCenterApi } from '../api/profit-center.api';
import { ProfitCenterMapper } from '../mappers/profit-center.mapper';

export interface ProfitCenterResult {
  isSuccess: boolean;
  data: ProfitCenter[] | null;
  message?: string;
}

export class ProfitCenterRepository {
  async getActive(): Promise<ProfitCenterResult> {
    try {
      const dtos = await profitCenterApi.getActive();
      const profitCenters = ProfitCenterMapper.toDomainList(dtos);
      
      return {
        isSuccess: true,
        data: profitCenters,
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        data: null,
        message: error?.message || 'Error al obtener los centros de beneficio',
      };
    }
  }
}

export const profitCenterRepository = new ProfitCenterRepository();
