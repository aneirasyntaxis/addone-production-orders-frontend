// Presentation - Navigation Types
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
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
