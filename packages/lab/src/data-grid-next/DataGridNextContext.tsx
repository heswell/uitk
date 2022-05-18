import { createContext, useContext } from "react";
import { DataGridNextModel } from "./DataGridNextModel";

export interface DataGridNextContext {
  dataGridModel: DataGridNextModel;
}

export const DataGridNextContext = createContext<
  DataGridNextContext | undefined
>(undefined);

export function useDataGridNextContext() {
  const c = useContext(DataGridNextContext);
  if (!c) {
    throw new Error(
      `useDataGridNextContext should be used within a DataGridNext`
    );
  }
  return c;
}
