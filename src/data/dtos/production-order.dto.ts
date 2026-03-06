// Data - Production Order DTOs
import { BatchNumbersDto } from './batch-numbers.dto';
import { ItemWarehouseInfoDto } from './item.dto';

export interface ProductionOrderLineDto {
  itemNo: string | null;
  itemName?: string;
  lineNumber?: number;
  baseQuantity: number;
  plannedQuantity?: number;
  issuedQuantity?: number;
  additionalQuantity?: number;
  warehouse?: string;
  itemType?: string;
  productionOrderIssueType?: string | null;
  lineText?: string;
  manageBatchNumbers?: boolean;
  itemWarehouseInfoCollection?: ItemWarehouseInfoDto[];
}

export interface ProductionOrderDto {
  productionOrderType: string;
  productionOrderStatus?: string;
  productDescription?: string;
  documentNumber?: number;
  absoluteEntry?: number;
  dueDate: string;
  itemNo: string;
  plannedQuantity: number;
  postingDate?: string;
  startDate?: string;
  creationDate?: string;
  journalRemarks?: string;
  remarks?: string | null;
  productionOrderOriginEntry?: number | null;
  productionOrderOriginNumber?: number | null;
  completedQuantity?: number;
  rejectedQuantity?: number;
  warehouse?: string;
  productionOrderLines: ProductionOrderLineDto[];
}

export interface CreateProductionOrderLineDto {
  ItemNo: string;
  BaseQuantity?: number;
  PlannedQuantity?: number;
  WarehouseCode?: string;
  ProductionOrderIssueType?: string;
  ItemType?: string;
  LineText?: string;
}

export interface CreateProductionOrderDto {
  DueDate: string;
  ItemNo: string;
  Warehouse: string;
  PlannedQuantity: number;
  PostingDate?: string;
  JournalRemarks?: string;
  Remarks?: string;
  ProductionOrderLines: CreateProductionOrderLineDto[];
}
