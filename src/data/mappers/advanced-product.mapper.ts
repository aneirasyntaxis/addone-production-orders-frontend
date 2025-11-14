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
      itemCode: dto.itemCode,
      lineNum: dto.lineNum,
      baseEntry: dto.baseEntry,
    };
  }

  static toDomain(dto: AdvancedProductDto): AdvancedProduct {
    return {
      docEntry: dto.docEntry,
      docNum: dto.docNum,
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
      BaseEntry: line.baseEntry,
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
