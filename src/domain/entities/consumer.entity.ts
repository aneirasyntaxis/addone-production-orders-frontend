// Domain - Consumer Entity (Consumo)
export interface ConsumerLine {
  baseLine?: number;
  baseEntry?: number;
  quantity: number;
  lineNumber?: number;
  itemCode?: string;
  itemDescription?: string;
  warehouseCode?: string;
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
  baseLine: number;
  baseEntry: number;
  quantity: number;
}

export interface CreateConsumer {
  docDate?: string;
  comments: string;
  journalMemo: string;
  documentLines: CreateConsumerLine[];
}
