// Data - Consumer DTOs
import { BatchNumbersDto } from './batch-numbers.dto';

export interface ConsumerLineDto {
  docEntry?: number;
  lineNum?: number;
  itemCode?: string;
  itemDescription?: string;
  baseLine?: number;
  baseEntry?: number;
  quantity: number;
  warehouseCode?: string;
  batchNumbers?: BatchNumbersDto[];
}

export interface ConsumerDto {
  docEntry?: number;
  docDate?: string;
  docDueDate?: string;
  docNum: number;
  comments: string;
  journalMemo: string;
  documentLines: ConsumerLineDto[];
}

export interface CreateConsumerLineDto {
  Quantity: number;
  ItemCode?: string;
  BaseEntry: number | null;
}

export interface CreateConsumerDto {
  DocDueDate: string;
  Comments: string;
  JournalMemo: string;
  DocumentLines: CreateConsumerLineDto[];
}
