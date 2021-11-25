namespace TableUpdateMethods {
  export function createUniqueKeys(
    this: Table,
    numberOfKeys: number
  ): Array<number> {
    if (!this.ids) this._loadIds();

    const currentIds = this.keysCreated
      ? [...this.ids, ...this.keysCreated]
      : this.ids;
    const sortedIds = currentIds.sort((idA, idB) => idA - idB);

    const newKeys = [];
    for (let i = 0; i != numberOfKeys; i++) {
      newKeys.push(sortedIds[sortedIds.length - 1] + 1 + i);
    }

    if (!this.keysCreated) {
      this.keysCreated = newKeys;
    } else {
      this.keysCreated.push(...newKeys);
    }

    return newKeys;
  }

  export function addRow(this: Table, row: Array<any>): number {
    if (!this._dataRange) this._loadDataRange();
    if (row.length > this.numColumns)
      throw "too many values for number of named columns";
    if (row[0] != false)
      throw "id position (index 0) must be falsy (it will be discarded and a new key created)";
    row[0] = this.createUniqueKeys(1)[0];
    // TODO - type consistency?
    this._sheet.appendRow(row);
    this._refreshMetaData();
    SpreadsheetApp.flush();
    return row[0]; // returning new ID
  }

  export function updateValue(
    this: Table,
    idToUpdate: number,
    headerName: string,
    value: any
  ): number {
    if (!this.ids) this._loadIds();
    if (!this.headers) this._loadHeaders();
    if (!this.headers.includes(headerName)) return undefined;

    const rowNumber: number = this._getRowNumber(idToUpdate);

    const colNumber = this.headers.indexOf(headerName) + 1;

    this._sheet.getRange(rowNumber, colNumber).setValue(value);
    return rowNumber;
  }

  export function updateRow(
    this: Table,
    idToUpdate: number,
    newRowValues: Array<any>
  ): void {
    if (!this.ids) this._loadIds();
    if (!this.headers) this._loadHeaders();

    const { rowNumber, row } = this.getRowById(idToUpdate);

    if (row[0] !== newRowValues[0]) throw "IDs don't match";
    if (row.length > this.headers.length) throw "wrong size of row";

    this._sheet
      .getRange(rowNumber, 1, 1, newRowValues.length)
      .setValues([newRowValues]); // must be Array<Array<any>>
  }

  export function deleteRow(this: Table, idToDelete: number): void {
    if (!this.ids) this._loadIds();
    if (!this._dataRange) this._loadDataRange();

    const rowNumber: number = this._getRowNumber(idToDelete);

    this._sheet.deleteRow(rowNumber);
    this._refreshMetaData();
  }
}
