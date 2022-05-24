import { TextColumnFilterModel } from "./TextColumnFilterModel";

export class ColumnMenuModel {
  public readonly filter: TextColumnFilterModel;

  constructor() {
    this.filter = new TextColumnFilterModel();
  }
}
