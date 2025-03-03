export type RootTabParamList = {
  Home: undefined;
  Courses: undefined;
  Optimize: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
