// Data - Production Order DTOs
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
}

export interface ProductionOrderDto {
  productionOrderType: string;
  productionOrderStatus?: string;
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
  BaseQuantity: number;
  PlannedQuantity?: number;
  ProductionOrderIssueType?: string;
  ItemType?: string;
}

export interface CreateProductionOrderDto {
  DueDate: string;
  ItemNo: string;
  PlannedQuantity: number;
  PostingDate?: string;
  JournalRemarks?: string;
  Remarks?: string;
  ProductionOrderLines: CreateProductionOrderLineDto[];
}
