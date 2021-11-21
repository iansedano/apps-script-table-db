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

interface Table {
  file: GoogleAppsScript.Spreadsheet.Spreadsheet;
  sheet: GoogleAppsScript.Spreadsheet.Sheet;
  ids: Array<number>;
  headers: Array<string>;
  dataRange?: GoogleAppsScript.Spreadsheet.Range;
  allValues?: Array<Array<any>>;
  numRows?: number;
  numColumns?: number;

  getRow(id: number): RowResult;
  getRowsByValue(headerName: string, value: any): Array<RowResult>;
  _loadIds(): void;
  _loadAllValues(): void;
  _loadHeaders(): void;
}

class Table {
  constructor(SS_ID: string, sheetName: string) {
    this.file = SpreadsheetApp.openById(SS_ID);
    this.sheet = this.file.getSheetByName(sheetName);
  }

  _loadHeaders(): void {
    this.headers = this.sheet.getRange("1:1").getValues()[0];
    if (this.headers[0] !== "id") throw "first column is not id";
  }

  _loadIds(): void {
    this.ids = this.sheet.getRange("A:A").getValues().flat();
    if (typeof this.ids[1] !== "number") throw "first id is not a number";
  }

  _loadDataRange(): void {
    this.dataRange = this.sheet.getDataRange();
    this.numRows = this.dataRange.getNumRows();
    this.numColumns = this.dataRange.getNumColumns();
  }

  _loadAllValues(): void {
    if (!this.dataRange) this._loadDataRange();
    this.allValues = this.dataRange.getValues();
  }

  getColumn(headerName: string): ColumnResult {
    if (!this.headers) this._loadHeaders();
    if (!this.headers.includes(headerName)) return undefined;
    if (!this.dataRange) this._loadDataRange();
    const columnNumber: number = this.headers.indexOf(headerName) + 1;

    return {
      columnNumber,
      column: this.sheet
        .getRange(1, columnNumber, this.numRows, 1)
        .getValues()
        .flat()
    };
  }

  getRow(searchId: number): RowResult {
    if (!this.ids) this._loadIds();
    if (!this.dataRange) this._loadDataRange();

    for (const [index, id] of this.ids.entries()) {
      if (id === searchId) {
        // index + 1 because rows begin at 1 not 0
        const rowNumber = index + 1;
        const row = this.sheet
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
    if (!this.dataRange) this._loadDataRange();

    const columnResult = this.getColumn(headerName);

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
            row: this.sheet
              .getRange(
                rowNumber,
                columnResult.columnNumber,
                1,
                this.numColumns
              )
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
}
