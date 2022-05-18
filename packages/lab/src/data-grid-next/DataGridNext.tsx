import React, { useMemo } from "react";
import { GridBase } from "../grid/components";
import { GridContext } from "../grid/GridContext";
import { DataGridNextContext } from "./DataGridNextContext";
import { DataGridNextModel } from "./DataGridNextModel";

export interface DataGridNextProps<TRowData = any> {
  dataGridModel: DataGridNextModel<TRowData>;
}

export const DataGridNext = function <TRowData = any>(
  props: DataGridNextProps<TRowData>
) {
  const { dataGridModel } = props;
  const dataGridNextContextValue = useMemo(
    () => ({ dataGridModel }),
    [dataGridModel]
  );

  const gridContextValue = useMemo(
    () => ({ model: dataGridModel.gridModel }),
    [dataGridModel.gridModel]
  );

  return (
    <DataGridNextContext.Provider value={dataGridNextContextValue}>
      <GridContext.Provider value={gridContextValue}>
        <GridBase />
      </GridContext.Provider>
    </DataGridNextContext.Provider>
  );
};
