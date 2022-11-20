import Vue, { InjectionKey } from "vue";
import { createStore, Store, useStore } from "vuex";

import modules from "./modules";
import { RootState } from "./modules/types";

export const key: InjectionKey<Store<RootState>> = Symbol();

export default createStore({
  modules,
  plugins: [],
  strict: process.env.NODE_ENV !== "production",
});

export function useAppStore() {
  return useStore(key);
}
