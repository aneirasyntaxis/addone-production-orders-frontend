// Domain - Advanced Product Entity (Avance)
export interface AdvancedProductLine {
  quantity: number;
  itemCode?: string;
  lineNum?: number;
  baseEntry?: number;
}

export interface AdvancedProduct {
  docEntry?: number;
  docNum?: number;
  docDueDate: string;
  comments: string;
  journalMemo: string;
  documentLines: AdvancedProductLine[];
}

export interface CreateAdvancedProductLine {
  quantity: number;
  itemCode?: string;
  baseEntry: number;
}

export interface CreateAdvancedProduct {
  docDueDate: string;
  comments: string;
  journalMemo: string;
  documentLines: CreateAdvancedProductLine[];
}
