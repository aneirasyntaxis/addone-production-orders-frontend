// Data - Advanced Product Mapper
import {
  AdvancedProduct,
  AdvancedProductLine,
  CreateAdvancedProduct,
  CreateAdvancedProductLine,
} from '../../domain/entities/advanced-product.entity';
import {
  AdvancedProductDto,
  AdvancedProductLineDto,
  CreateAdvancedProductDto,
  CreateAdvancedProductLineDto,
} from '../dtos/advanced-product.dto';

export class AdvancedProductMapper {
  static lineToDomain(dto: AdvancedProductLineDto): AdvancedProductLine {
    return {
      quantity: dto.quantity,
      itemCode: dto.itemCode ?? undefined,
      lineNum: dto.lineNum,
      baseEntry: dto.baseEntry,
      baseLine: dto.baseLine,
      warehouseCode: dto.warehouseCode ?? undefined,
      batchNumbers: dto.batchNumbers,
    };
  }

  static toDomain(dto: AdvancedProductDto): AdvancedProduct {
    return {
      docEntry: dto.docEntry,
      docNum: dto.docNum,
      docDate: '',
      docDueDate: dto.docDueDate,
      comments: dto.comments,
      journalMemo: dto.journalMemo,
      documentLines: dto.documentLines.map((line) => this.lineToDomain(line)),
    };
  }

  static toDomainList(dtos: AdvancedProductDto[]): AdvancedProduct[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  static lineToDto(line: CreateAdvancedProductLine): CreateAdvancedProductLineDto {
    return {
      Quantity: line.quantity,
      ItemCode: line.itemCode,
      ProjectCode: line.projectCode,
      CostingCode: line.costingCode,
      BaseEntry: line.baseEntry,
      BaseLine: line.baseLine,
      BaseType: line.baseType,
      BatchNumbers: line.batchNumbers,
    };
  }

  static toDto(product: CreateAdvancedProduct): CreateAdvancedProductDto {
    return {
      DocDueDate: product.docDueDate,
      Comments: product.comments,
      JournalMemo: product.journalMemo,
      DocumentLines: product.documentLines.map((line) => this.lineToDto(line)),
    };
  }
}
