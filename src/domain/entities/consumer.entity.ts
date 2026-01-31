// Domain - Consumer Entity (Consumo)
import { BatchNumbers } from './batch-numbers.entity';

export interface ConsumerLine {
  baseLine?: number;
  baseEntry?: number;
  quantity: number;
  lineNumber?: number;
  itemCode?: string;
  itemDescription?: string;
  warehouseCode?: string;
  accountCode?: string;
  costingCode?: string;
  projectCode?: string;
  batchNumbers?: BatchNumbers[];
}

export interface Consumer {
  docEntry?: number;
  docDate?: string;
  docDueDate?: string;
  taxDate?: string;
  docNum: number;
  series?: number;
  comments?: string;
  journalMemo?: string;
  reference1?: string;
  reference2?: string;
  documentLines: ConsumerLine[];
}

export interface CreateConsumerLine {
  quantity: number;
  itemCode?: string;
  warehouseCode?: string;
  projectCode?: string;
  costingCode?: string;
  baseEntry: number | null;
  baseLine?: number;
  baseType?: number;
}

export interface CreateConsumer {
  docDueDate: string;
  comments: string;
  journalMemo: string;
  documentLines: CreateConsumerLine[];
}
