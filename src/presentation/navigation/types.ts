// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  CreateProductionOrder: undefined;
  ProductionOrderDetail: { id: number };
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
