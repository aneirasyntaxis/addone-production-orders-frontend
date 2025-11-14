// Data - Consumer DTOs
export interface ConsumerLineDto {
  baseLine?: number;
  baseEntry?: number;
  quantity: number;
}

export interface ConsumerDto {
  docEntry?: number;
  docDate?: string;
  docNum: number;
  comments: string;
  journalMemo: string;
  documentLines: ConsumerLineDto[];
}

export interface CreateConsumerLineDto {
  BaseLine: number;
  BaseEntry: number;
  Quantity: number;
}

export interface CreateConsumerDto {
  DocDate?: string;
  Comments: string;
  JournalMemo: string;
  DocumentLines: CreateConsumerLineDto[];
}
