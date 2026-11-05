"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./index";
import { AuthInitializer } from "@/features/auth/components/auth-initializer";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  return (
    <Provider store={store}>
      <AuthInitializer />
      {children}
    </Provider>
  );
}
