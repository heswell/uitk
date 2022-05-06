import {
  VuuColumnDefinition,
  VuuColumnType,
  VuuConfig,
  VuuDataSet,
  VuuRow,
} from "./VuuDataSet";
import { ColumnDefinition, GridModel, RowKeyGetter } from "../../grid";
import {
  NumericCellValueVuu,
  TextCellValueVuu,
  BidAskCellValueVuu,
} from "../columns";

const getValueComponent = (columnType: VuuColumnType) => {
  if (columnType === "number") {
    return NumericCellValueVuu;
  }
  if (columnType === "string") {
    return TextCellValueVuu;
  }
  return BidAskCellValueVuu;
};

export class VuuGridModel {
  public readonly gridModel: GridModel<VuuRow>;
  public readonly dataSet: VuuDataSet;

  constructor(
    getKey: RowKeyGetter<VuuRow>,
    columns: VuuColumnDefinition[],
    vuuConfig: VuuConfig
  ) {
    this.gridModel = new GridModel<VuuRow>(getKey);
    this.dataSet = new VuuDataSet(columns, vuuConfig, getKey);
    this.dataSet.columns$.subscribe((columns) => {
      const gridColumnDefinitions = columns.map((column) => {
        const cellValueComponent = getValueComponent(column.definition.type);
        const columnDefinition: ColumnDefinition<VuuRow> = {
          key: column.definition.key,
          title: column.definition.header,
          cellValueGetter: (row) => row.cells.get(column.definition.key),
          cellValueComponent,
        };
        return columnDefinition;
      });
      this.gridModel.setColumnDefinitions(gridColumnDefinitions);
    });

    this.gridModel.visibleRowRange$.subscribe((range) => {
      // console.log(`VuuGridModel: visibleRowRange changed to ${range}`);
      this.dataSet.visibleRange$.next(range);
    });

    this.dataSet.rows$.subscribe((rows) => {
      // console.log(
      //   `VuuGridModel: rows$ changed. Calling gridModel.setData(...)`
      // );
      this.gridModel.setData(rows);
    });
  }
}
