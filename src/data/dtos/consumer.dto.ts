// Data - Consumer DTOs
import { BatchNumbersDto, CreateBatchNumbersDto } from './batch-numbers.dto';
import { ItemWarehouseInfoDto } from './item.dto';

export interface ConsumerLineDto {
  docEntry?: number;
  lineNum?: number;
  itemCode?: string;
  itemDescription?: string;
  baseLine?: number;
  baseEntry?: number;
  quantity: number;
  warehouseCode?: string;
  projectCode?: string;
  costingCode?: string;
  price?: number;
  batchNumbers?: BatchNumbersDto[];
  manageBatchNumbers?: boolean;
  itemWarehouseInfoCollection?: ItemWarehouseInfoDto[];
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
  WarehouseCode?: string;
  ProjectCode?: string;
  CostingCode?: string;
  Price?: number;
  BaseEntry: number | null;
  BaseLine?: number;
  BaseType?: number;
  BatchNumbers?: CreateBatchNumbersDto[];
}

export interface CreateConsumerDto {
  DocDueDate: string;
  Comments: string;
  JournalMemo: string;
  DocumentLines: CreateConsumerLineDto[];
}
