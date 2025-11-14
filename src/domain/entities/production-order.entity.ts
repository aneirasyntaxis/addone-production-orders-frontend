// Domain - Production Order Entity
export interface ProductionOrderLine {
  itemNo: string | null;
  lineNumber?: number;
  baseQuantity: number;
  plannedQuantity?: number;
  issuedQuantity?: number;
  productionOrderIssueType?: string | null;
}

export interface ProductionOrder {
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
  productionOrderLines: ProductionOrderLine[];
}

export interface CreateProductionOrderLine {
  itemNo: string;
  baseQuantity: number;
  plannedQuantity?: number;
  productionOrderIssueType?: string;
}

export interface CreateProductionOrder {
  dueDate: string;
  itemNo: string;
  plannedQuantity: number;
  postingDate?: string;
  journalRemarks?: string;
  remarks?: string;
  productionOrderLines: CreateProductionOrderLine[];
}
