// Data - Production Order DTOs
export interface ProductionOrderLineDto {
  itemNo: string | null;
  lineNumber?: number;
  baseQuantity: number;
  plannedQuantity?: number;
  issuedQuantity?: number;
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
  journalRemarks?: string;
  remarks?: string | null;
  productionOrderOriginEntry?: number | null;
  productionOrderOriginNumber?: number | null;
  productionOrderLines: ProductionOrderLineDto[];
}

export interface CreateProductionOrderLineDto {
  ItemNo: string;
  BaseQuantity: number;
  PlannedQuantity?: number;
  ProductionOrderIssueType?: string;
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
