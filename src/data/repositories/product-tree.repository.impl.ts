// Data Layer - Product Tree Repository Implementation
import { IProductTreeRepository } from '../../domain/repositories/product-tree.repository';
import { ProductTree, ProductTreeLine } from '../../domain/entities/product-tree.entity';
import { productTreeApi, ProductTreeDto, ProductTreeLineDto } from '../api/product-tree.api';
import { logger } from '../../core/logging/logger';

export class ProductTreeRepositoryImpl implements IProductTreeRepository {
  async searchByTreeCode(treeCodePart: string): Promise<ProductTree[]> {
    try {
      logger.debug('ProductTreeRepository: Searching by tree code', { treeCodePart });
      const dtos = await productTreeApi.searchByTreeCode(treeCodePart);
      logger.debug('ProductTreeRepository: Mapping DTOs to entities', { count: dtos.length });
      return dtos.map((dto) => this.mapDtoToEntity(dto));
    } catch (error) {
      logger.error('ProductTreeRepository: Search failed', { 
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getByTreeCode(treeCode: string): Promise<ProductTree | null> {
    try {
      logger.debug('ProductTreeRepository: Getting by tree code', { treeCode });
      const dto = await productTreeApi.getByTreeCode(treeCode);
      return dto ? this.mapDtoToEntity(dto) : null;
    } catch (error) {
      logger.error('ProductTreeRepository: Get failed', { error });
      throw error;
    }
  }

  private mapDtoToEntity(dto: ProductTreeDto): ProductTree {
    try {
      logger.debug('ProductTreeRepository: Mapping DTO', { 
        treeCode: dto.treeCode,
        linesCount: dto.productTreeLines?.length || 0 
      });

      return {
        treeCode: dto.treeCode,
        productDescription: dto.productDescription,
        quantity: dto.quantity,
        warehouse: dto.warehouse,
        productTreeLines: (dto.productTreeLines || []).map((line) => this.mapLineDtoToEntity(line)),
        itemWarehouseInfoCollection: dto.itemWarehouseInfoCollection,
      };
    } catch (error) {
      logger.error('ProductTreeRepository: Mapping failed', { 
        error,
        dto: JSON.stringify(dto)
      });
      throw error;
    }
  }

  private mapLineDtoToEntity(dto: ProductTreeLineDto): ProductTreeLine {
    return {
      itemCode: dto.itemCode,
      itemName: dto.itemName,
      quantity: dto.quantity,
      warehouse: dto.warehouse,
      issueMethod: dto.issueMethod,
      itemType: dto.itemType,
      lineText: dto.lineText,
      manageBatchNumbers: dto.manageBatchNumbers,
      itemWarehouseInfoCollection: dto.itemWarehouseInfoCollection,
    };
  }
}

export const productTreeRepository = new ProductTreeRepositoryImpl();
