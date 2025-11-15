// Data Layer - Product Tree API
import { apiClient } from './api-client';
import { ApiResponse } from '../dtos/company.dto';
import { logger } from '../../core/logging/logger';

export interface ProductTreeLineDto {
  itemCode: string;
  quantity: number;
  warehouse: string;
  price: number;
  currency: string;
  issueMethod: string;
  inventoryUOM?: string;
  comment?: string;
  parentItem: string;
  priceList?: number;
  distributionRule?: string;
  project?: string;
  distributionRule2?: string;
  distributionRule3?: string;
  distributionRule4?: string;
  distributionRule5?: string;
  wipAccount?: string;
  itemType: string;
  lineText?: string;
  additionalQuantity?: number;
  stageID?: string;
  childNum: number;
  visualOrder: number;
  itemName: string;
  u_Clase?: string;
}

export interface ProductTreeDto {
  treeCode: string;
  treeType: string;
  quantity: number;
  distributionRule?: string;
  project?: string;
  distributionRule2?: string;
  distributionRule3?: string;
  distributionRule4?: string;
  distributionRule5?: string;
  priceList: number;
  warehouse: string;
  planAvgProdSize: number;
  hideBOMComponentsInPrintout: string;
  productDescription: string;
  u_Resultado?: string;
  u_TipoProceso?: string;
  productTreeLines: ProductTreeLineDto[];
  productTreeStages: any[];
}

export class ProductTreeApi {
  async searchByTreeCode(treeCodePart: string): Promise<ProductTreeDto[]> {
    try {
      logger.debug('ProductTreeApi: Searching by tree code', { treeCodePart });
      const response = await apiClient.get<ApiResponse<ProductTreeDto[]>>(
        `/product-trees/search/${encodeURIComponent(treeCodePart)}`
      );
      
      if (!response.isSuccess || !response.data) {
        logger.warn('ProductTreeApi: Search returned no data');
        return [];
      }

      logger.debug('ProductTreeApi: Search successful', { 
        count: response.data.length 
      });
      return response.data;
    } catch (error) {
      logger.error('ProductTreeApi: Search failed', { error });
      throw error;
    }
  }

  async getByTreeCode(treeCode: string): Promise<ProductTreeDto | null> {
    try {
      logger.debug('ProductTreeApi: Getting by tree code', { treeCode });
      const response = await apiClient.get<ApiResponse<ProductTreeDto>>(
        `/product-trees/${encodeURIComponent(treeCode)}`
      );
      
      if (!response.isSuccess || !response.data) {
        logger.warn('ProductTreeApi: Tree code not found');
        return null;
      }

      logger.debug('ProductTreeApi: Get successful');
      return response.data;
    } catch (error) {
      logger.error('ProductTreeApi: Get failed', { error });
      throw error;
    }
  }
}

export const productTreeApi = new ProductTreeApi();
