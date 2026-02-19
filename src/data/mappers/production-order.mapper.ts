// Data - Production Order Mapper
import {
  ProductionOrder,
  ProductionOrderLine,
  CreateProductionOrder,
  CreateProductionOrderLine,
} from '../../domain/entities/production-order.entity';
import {
  ProductionOrderDto,
  ProductionOrderLineDto,
  CreateProductionOrderDto,
  CreateProductionOrderLineDto,
} from '../dtos/production-order.dto';

export class ProductionOrderMapper {
  static lineToDomain(dto: ProductionOrderLineDto): ProductionOrderLine {
    return {
      itemNo: dto.itemNo ?? null,
      itemName: dto.itemName,
      lineNumber: dto.lineNumber,
      baseQuantity: dto.baseQuantity,
      plannedQuantity: dto.plannedQuantity,
      issuedQuantity: dto.issuedQuantity,
      additionalQuantity: dto.additionalQuantity,
      warehouse: dto.warehouse,
      itemType: dto.itemType,
      productionOrderIssueType: dto.productionOrderIssueType,
      lineText: dto.lineText,
      manageBatchNumbers: dto.manageBatchNumbers,
      itemWarehouseInfoCollection: dto.itemWarehouseInfoCollection,
    };
  }

  static toDomain(dto: ProductionOrderDto): ProductionOrder {
    return {
      productionOrderType: dto.productionOrderType,
      productionOrderStatus: dto.productionOrderStatus,
      productDescription: dto.productDescription,
      documentNumber: dto.documentNumber,
      absoluteEntry: dto.absoluteEntry,
      startDate: dto.startDate ?? '',
      dueDate: dto.dueDate,
      creationDate: dto.creationDate,
      itemNo: dto.itemNo,
      plannedQuantity: dto.plannedQuantity,
      completedQuantity: dto.completedQuantity,
      rejectedQuantity: dto.rejectedQuantity,
      warehouse: dto.warehouse,
      postingDate: dto.postingDate,
      journalRemarks: dto.journalRemarks,
      remarks: dto.remarks,
      productionOrderOriginEntry: dto.productionOrderOriginEntry,
      productionOrderOriginNumber: dto.productionOrderOriginNumber,
      productionOrderLines: dto.productionOrderLines.map((line) => this.lineToDomain(line)),
    };
  }

  static toDomainList(dtos: ProductionOrderDto[]): ProductionOrder[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  static lineToDto(line: CreateProductionOrderLine): CreateProductionOrderLineDto {
    return {
      ItemNo: line.itemNo,
      // BaseQuantity: line.baseQuantity,
      PlannedQuantity: line.plannedQuantity,
      ProductionOrderIssueType: line.productionOrderIssueType,
      ItemType: line.itemType,
      LineText: line.lineText,
    };
  }

  static toDto(order: CreateProductionOrder): CreateProductionOrderDto {
    return {
      DueDate: order.dueDate,
      ItemNo: order.itemNo,
      Warehouse: order.warehouse,
      PlannedQuantity: order.plannedQuantity,
      PostingDate: order.postingDate,
      JournalRemarks: order.journalRemarks,
      Remarks: order.remarks,
      ProductionOrderLines: order.productionOrderLines.map((line) => this.lineToDto(line)),
    };
  }
}
