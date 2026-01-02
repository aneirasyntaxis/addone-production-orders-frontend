// Domain - Advanced Product Entity (Avance)
import { BatchNumbers } from './batch-numbers.entity';

export interface AdvancedProductLine {
  quantity: number;
  itemCode?: string;
  lineNum?: number;
  lineNumber?: number;
  baseEntry?: number;
  baseLine?: number;
  itemDescription?: string;
  warehouseCode?: string;
  batchNumbers?: BatchNumbers[];
}

export interface AdvancedProduct {
  docEntry?: number;
  docNum?: number;
  series?: number;
  docDate: string;
  docDueDate: string;
  taxDate?: string;
  comments?: string;
  journalMemo?: string;
  reference1?: string;
  reference2?: string;
  documentLines: AdvancedProductLine[];
}

export interface CreateAdvancedProductLine {
  quantity: number;
  itemCode?: string;
  baseEntry: number | null;
  baseLine?: number;
  baseType?: number | null;
  batchNumbers?: BatchNumbers[];
}

export interface CreateAdvancedProduct {
  docDueDate: string;
  comments: string;
  journalMemo: string;
  documentLines: CreateAdvancedProductLine[];
}
