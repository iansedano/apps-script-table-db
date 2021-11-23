/*

The design of this class must take into account the fact that the
table will be reinitialized at every execution. Hence loading ids, headers,
values are all done depending on the task at hand.

*/

interface RowResult {
  rowNumber: number;
  row: Array<any>;
}

interface ColumnResult {
  columnNumber: number;
  column: Array<any>;
}

interface TableInterface {
  _file: GoogleAppsScript.Spreadsheet.Spreadsheet;
  _sheet: GoogleAppsScript.Spreadsheet.Sheet;
  ids: Array<number>;
  headers: Array<string>;
  _dataRange: GoogleAppsScript.Spreadsheet.Range;
  allValues: Array<Array<any>>;
  numRows: number;
  numColumns: number;
  _keysCreated: Array<number>;

  _loadIds(): void;
  _loadAllValues(): void;
  _loadHeaders(): void;
  _getRowNumber(searchId: number): number;
  getColumnByHeader(headerName: string): ColumnResult;
  getRowById(id: number): RowResult;
  getRowsByValue(headerName: string, value: any): Array<RowResult>;
  addRow(row: Array<any>): void;
  updateValue(idToUpdate: number, headerName: string, value: any): number;
  updateRow(idToUpdate: number, row: Array<any>): void;
  deleteRow(idToDelete: number): void;
  createUniqueKeys(numberOfKeys: number): Array<number>;
}

class Table implements TableInterface {
  _file: GoogleAppsScript.Spreadsheet.Spreadsheet;
  _sheet: GoogleAppsScript.Spreadsheet.Sheet;
  ids: Array<number>;
  headers: Array<string>;
  _dataRange: GoogleAppsScript.Spreadsheet.Range;
  allValues: Array<Array<any>>;
  numRows: number;
  numColumns: number;
  _keysCreated: Array<number>;

  constructor(SS_ID: string, sheetName: string) {
    this._file = SpreadsheetApp.openById(SS_ID);
    this._sheet = this._file.getSheetByName(sheetName);
  }

  _loadHeaders(): void {
    if (!this._dataRange) this._loadDataRange();
    this.headers = this._sheet
      .getRange(1, 1, 1, this.numColumns)
      .getValues()[0];
    if (this.headers[0] !== "id") throw "first column is not id";
  }

  _loadIds(): void {
    this.ids = this._sheet.getRange("A:A").getValues().flat();
    if (typeof this.ids[1] !== "number") throw "first id is not a number";
  }

  _loadDataRange(): void {
    this._dataRange = this._sheet.getDataRange();
    this.numRows = this._dataRange.getNumRows();
    this.numColumns = this._dataRange.getNumColumns();
  }

  _loadAllValues(): void {
    if (!this._dataRange) this._loadDataRange();
    this.allValues = this._dataRange.getValues();
  }

  _getRowNumber(searchId: number): number {
    if (!this.ids) this._loadIds();

    for (const [index, id] of this.ids.entries()) {
      if (id === searchId) {
        // index + 1 because rows begin at 1 not 0
        const rowNumber = index + 1;
        return rowNumber;
      }
    }
  }

  _refreshMetaData() {
    if (this.ids) this._loadIds();
    // TODO - maybe have a different method for headers?
    if (this.headers) this._loadHeaders();
    if (this._dataRange) this._loadDataRange();
    if (this.allValues) this._loadAllValues();
  }

  getColumnByHeader(headerName: string): ColumnResult {
    if (!this.headers) this._loadHeaders();
    if (!this.headers.includes(headerName)) return undefined;
    if (!this._dataRange) this._loadDataRange();
    const columnNumber: number = this.headers.indexOf(headerName) + 1;

    return {
      columnNumber,
      column: this._sheet
        .getRange(1, columnNumber, this.numRows, 1)
        .getValues()
        .flat()
    };
  }

  getRowById(searchId: number): RowResult {
    if (!this.ids) this._loadIds();
    if (!this._dataRange) this._loadDataRange();

    for (const [index, id] of this.ids.entries()) {
      if (id === searchId) {
        // index + 1 because rows begin at 1 not 0
        const rowNumber = index + 1;
        const row = this._sheet
          .getRange(rowNumber, 1, 1, this.numColumns)
          .getValues()[0];
        return { rowNumber, row };
      }
    }

    return undefined;
  }

  getRowsByValue(headerName: string, query: any): Array<RowResult> {
    if (!this.ids) this._loadIds();
    if (!this.headers) this._loadHeaders();
    if (!this.headers.includes(headerName)) return undefined;
    if (!this._dataRange) this._loadDataRange();

    const columnResult = this.getColumnByHeader(headerName);

    const rowResults: Array<RowResult> = columnResult.column.reduce(
      (
        output: Array<RowResult>,
        value: any,
        index: number,
        array: any
      ): Array<RowResult> => {
        if (value === query) {
          // index + 1 because rows begin at 1 not 0
          const rowNumber = index + 1;
          output.push({
            rowNumber,
            row: this._sheet
              .getRange(rowNumber, 1, 1, this.numColumns)
              .getValues()[0]
          });
        }
        return output;
      },
      []
    );

    if (rowResults.length === 0) return undefined;

    return rowResults;
  }

  createUniqueKeys(numberOfKeys: number): Array<number> {
    if (!this.ids) this._loadIds();

    const currentIds = this._keysCreated
      ? [...this.ids, ...this._keysCreated]
      : this.ids;
    const sortedIds = currentIds.sort((idA, idB) => idA - idB);

    const newKeys = [];
    for (let i = 0; i != numberOfKeys; i++) {
      newKeys.push(sortedIds[sortedIds.length - 1] + 1 + i);
    }

    if (!this._keysCreated) {
      this._keysCreated = newKeys;
    } else {
      this._keysCreated.push(...newKeys);
    }

    return newKeys;
  }

  addRow(row: Array<any>): number {
    if (!this._dataRange) this._loadDataRange();
    if (row.length > this.numColumns)
      throw "too many values for number of named columns";
    if (row[0] != false)
      throw "id position (index 0) must be falsy (it will be discarded and a new key created)";
    row[0] = this.createUniqueKeys(1)[0];
    // TODO - type consistency?
    this._sheet.appendRow(row);
    this._refreshMetaData();
    return row[0]; // returning new ID
  }

  updateValue(idToUpdate: number, headerName: string, value: any): number {
    if (!this.ids) this._loadIds();
    if (!this.headers) this._loadHeaders();
    if (!this.headers.includes(headerName)) return undefined;

    const rowNumber: number = this._getRowNumber(idToUpdate);

    const colNumber = this.headers.indexOf(headerName) + 1;

    this._sheet.getRange(rowNumber, colNumber).setValue(value);
    return rowNumber;
  }

  updateRow(idToUpdate: number, newRowValues: Array<any>): void {
    if (!this.ids) this._loadIds();
    if (!this.headers) this._loadHeaders();

    const { rowNumber, row } = this.getRowById(idToUpdate);

    if (row[0] !== newRowValues[0]) throw "IDs don't match";
    if (row.length > this.headers.length) throw "wrong size of row";

    this._sheet
      .getRange(rowNumber, 1, 1, newRowValues.length)
      .setValues([newRowValues]); // must be Array<Array<any>>
  }

  deleteRow(idToDelete: number): void {
    if (!this.ids) this._loadIds();
    if (!this._dataRange) this._loadDataRange();

    const rowNumber: number = this._getRowNumber(idToDelete);

    this._sheet.deleteRow(rowNumber);
    this._refreshMetaData();
  }
}
