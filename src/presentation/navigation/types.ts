// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  CreateProductionOrder: undefined;
  CreateAdvancedProduct: { consumerId: number };
  CreateProductionReceipt: { productionOrderId: number };
  CreateConsumer: { productionOrderId?: number } | undefined;
  CreateConsumerFromSales: undefined;
  ProductionOrderDetail: { id: number };
  ProductionOrderConsumers: { productionOrderId: number };
  ProductionOrderAdvancedProducts: { productionOrderId: number };
  AdvancedProductDetail: { id: number };
  ConsumerDetail: { id: number };
};

export type MainTabsParamList = {
  ProductionOrders: undefined;
  AdvancedProducts: undefined;
  Consumers: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
