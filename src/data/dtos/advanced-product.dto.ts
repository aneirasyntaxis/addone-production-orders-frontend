// Data - Advanced Product DTOs
import { BatchNumbersDto } from './batch-numbers.dto';

export interface AdvancedProductLineDto {
  docEntry?: number;
  quantity: number;
  itemCode?: string | null;
  lineNum?: number;
  baseEntry?: number;
  warehouseCode?: string | null;
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
