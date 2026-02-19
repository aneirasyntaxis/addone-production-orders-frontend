// Domain - Product Tree Entity
import { ItemWarehouseInfo } from './item.entity';

export interface ProductTreeLine {
  itemCode: string;
  itemName: string;
  quantity: number;
  warehouse: string;
  itemType: string;
  issueMethod?: string;
  lineText?: string;
  manageBatchNumbers?: boolean;
  itemWarehouseInfoCollection?: ItemWarehouseInfo[];
}

export interface ProductTree {
  treeCode: string;
  productDescription: string;
  quantity: number;
  warehouse: string;
  productTreeLines: ProductTreeLine[];
  itemWarehouseInfoCollection?: ItemWarehouseInfo[];
}
