namespace TableUpdateMethods {
  export function createUniqueKeys(
    this: Table,
    numberOfKeys: number
  ): Array<number> {
    if (this.ids.length == 0) {
      return [1];
    }

    const sortedIds = this.ids.sort((idA, idB) => idA - idB);

    const newKeys = [];
    for (let i = 0; i != numberOfKeys; i++) {
      newKeys.push(sortedIds[sortedIds.length - 1] + 1 + i);
    }

    return newKeys;
  }

  export function addRow(this: Table, row: Array<any>): number {
    if (!this.dataRange) this.load();
    if (row.length > this.numColumns)
      throw "too many values for number of named columns";
    if (Boolean(row[0]) != false)
      throw "id position (index 0) must be falsy (it will be discarded and a new key created)";
    row[0] = this.createUniqueKeys(1)[0];
    // TODO - type consistency?
    this.sheet.appendRow(row);
    this.update();
    return row[0]; // returning new ID
  }

  export function updateValue(
    this: Table,
    idToUpdate: number,
    headerName: string,
    value: any
  ): number {
    if (!this.headers.includes(headerName)) return undefined;

    const rowNumber: number = this._getRowNumber(idToUpdate);

    const colNumber = this.headers.indexOf(headerName) + 1;

    this.sheet.getRange(rowNumber, colNumber).setValue(value);
    this.update();
    return rowNumber;
  }

  export function updateRow(
    this: Table,
    idToUpdate: number,
    newRowValues: Array<any>
  ): void {
    const { rowNumber, row } = this.getRowById(idToUpdate);

    if (row[0] !== newRowValues[0]) throw "IDs don't match";
    if (row.length > this.headers.length) throw "wrong size of row";

    this.sheet
      .getRange(rowNumber, 1, 1, newRowValues.length)
      .setValues([newRowValues]); // must be Array<Array<any>>
    this.update();
  }

  export function deleteRow(this: Table, idToDelete: number): void {
    const rowNumber: number = this._getRowNumber(idToDelete);

    this.sheet.deleteRow(rowNumber);
    this.update();
  }
}
