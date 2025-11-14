// Data - Advanced Product DTOs
export interface AdvancedProductLineDto {
  quantity: number;
  itemCode?: string | null;
  lineNum?: number;
  baseEntry?: number;
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
  BaseEntry: number;
}

export interface CreateAdvancedProductDto {
  DocDueDate: string;
  Comments: string;
  JournalMemo: string;
  DocumentLines: CreateAdvancedProductLineDto[];
}
