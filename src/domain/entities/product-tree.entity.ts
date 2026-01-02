// Domain - Product Tree Entity
export interface ProductTreeLine {
  itemCode: string;
  itemName: string;
  quantity: number;
  warehouse: string;
  itemType: string;
  issueMethod?: string;
}

export interface ProductTree {
  treeCode: string;
  productDescription: string;
  quantity: number;
  warehouse: string;
  productTreeLines: ProductTreeLine[];
}
