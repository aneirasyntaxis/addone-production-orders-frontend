// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  CreateProductionOrder: undefined;
  CreateAdvancedProduct: { consumerId?: number; productionOrderId?: number } | undefined;
  CreateConsumer: { productionOrderId?: number } | undefined;
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
