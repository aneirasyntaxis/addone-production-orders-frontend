// Domain - Production Order Entity
export interface ProductionOrderLine {
  itemNo: string | null;
  itemName?: string;
  lineNumber?: number;
  baseQuantity: number;
  plannedQuantity?: number;
  issuedQuantity?: number;
  additionalQuantity?: number;
  productionOrderIssueType?: string | null;
  itemType?: string;
  warehouse?: string;
}

export interface ProductionOrder {
  productionOrderType: string;
  productionOrderStatus?: string;
  productionOrderOrigin?: string;
  documentNumber?: number;
  absoluteEntry?: number;
  startDate: string;
  dueDate: string;
  creationDate?: string;
  itemNo: string;
  plannedQuantity: number;
  completedQuantity?: number;
  rejectedQuantity?: number;
  postingDate?: string;
  journalRemarks?: string;
  remarks?: string | null;
  productionOrderOriginEntry?: number | null;
  productionOrderOriginNumber?: number | null;
  warehouse?: string;
  customerCode?: string;
  productionOrderLines: ProductionOrderLine[];
}

export interface CreateProductionOrderLine {
  itemNo: string;
  baseQuantity: number;
  plannedQuantity?: number;
  productionOrderIssueType?: string;
  itemType?: string;
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
