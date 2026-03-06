// Domain - Production Order Entity
import { BatchNumbers } from './batch-numbers.entity';
import { ItemWarehouseInfo } from './item.entity';

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
  lineText?: string;
  manageBatchNumbers?: boolean;
  itemWarehouseInfoCollection?: ItemWarehouseInfo[];
}

export interface ProductionOrder {
  productionOrderType: string;
  productionOrderStatus?: string;
  productDescription?: string;
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
  baseQuantity?: number;
  plannedQuantity?: number;
  warehouseCode?: string;
  productionOrderIssueType?: string;
  itemType?: string;
  lineText?: string;
}

export interface CreateProductionOrder {
  productionOrderType?: string;
  dueDate: string;
  itemNo: string;
  warehouse: string;
  plannedQuantity: number;
  postingDate?: string;
  journalRemarks?: string;
  remarks?: string;
  productionOrderLines: CreateProductionOrderLine[];
}
