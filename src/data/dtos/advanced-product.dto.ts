// Data - Advanced Product DTOs
import { BatchNumbersDto } from './batch-numbers.dto';

export interface AdvancedProductLineDto {
  docEntry?: number;
  quantity: number;
  itemCode?: string | null;
  itemDescription?: string | null;
  lineNum?: number;
  baseEntry?: number;
  baseLine?: number;
  warehouseCode?: string | null;
  projectCode?: string | null;
  costingCode?: string | null;
  unitPrice?: number;
  batchNumbers?: BatchNumbersDto[];
}

export interface AdvancedProductDto {
  docEntry?: number;
  docNum?: number;
  docDueDate: string;
  comments: string;
  journalMemo: string;
  documentLines: AdvancedProductLineDto[];
}

export interface CreateAdvancedProductLineDto {
  Quantity: number;
  ItemCode?: string;
  ProjectCode?: string;
  CostingCode?: string;
  UnitPrice?: number;
  BaseEntry: number | null;
  BaseLine?: number;
  BaseType?: number | null;
  BatchNumbers?: BatchNumbersDto[];
}

export interface CreateAdvancedProductDto {
  DocDueDate: string;
  Comments: string;
  JournalMemo: string;
  DocumentLines: CreateAdvancedProductLineDto[];
}
