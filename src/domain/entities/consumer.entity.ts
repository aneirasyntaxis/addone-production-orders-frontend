// Domain - Consumer Entity (Consumo)
export interface ConsumerLine {
  baseLine?: number;
  baseEntry?: number;
  quantity: number;
}

export interface Consumer {
  docEntry?: number;
  docDate?: string;
  docNum: number;
  comments: string;
  journalMemo: string;
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
