type RowResult = {
  rowNumber: number;
  row: Array<any>;
};

type ColumnResult = {
  columnNumber: number;
  column: Array<any>;
};

type OrderedFilterObject = { headers: string[]; values: any[] };
type Entry = { id?: number };

interface TableInterface {
  getIds(): Array<number>;
  getHeaders(): Array<string>;

  getEntries(filterObject: Object): Array<Entry>; // empty obj returns everything

  addEntry(entry: Entry): void;

  updateValue(idToUpdate: number, headerName: string, value: any): number;
  updateRow(idToUpdate: number, row: Array<any>): void;
  deleteRow(idToDelete: number): void;
  createUniqueKeys(numberOfKeys: number): Array<number>;

  clearEntries(): void;

  // checkUniqueKeys();
  // ensureSortedById();
  // checkLimits();
}

class Table implements TableInterface {
  protected _sheet: GoogleAppsScript.Spreadsheet.Sheet;
  protected _dataRange: GoogleAppsScript.Spreadsheet.Range; // All data including headers
  protected _entryRange: GoogleAppsScript.Spreadsheet.Range; // All data excluding headers

  protected _ids: Array<number>;
  protected _headers: Array<string>;
  protected _entries: Array<Array<any>>;
  protected numRows: number;
  protected numColumns: number;
  protected keysCreated: Array<number>;
  protected _values: Array<Array<any>>;

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this._sheet = sheet;
    this._loadData();
  }

  public getIds(): Array<number> {
    return this._ids;
  }
  public getHeaders(): Array<string> {
    return this._headers;
  }
  public clearEntries(): void {
    // this._loadData(); // Probably not needed but might be good to have as failsafe
    this._entryRange.clear();
  }

  protected _loadData(this: Table): void {
    this._dataRange = this._sheet.getDataRange();
    this._values = this._dataRange.getValues();
    this._headers = this._values[0];
    if (this._headers[0] !== "id") throw "first column must be 'id' lowercase";
    this.numRows = this._values.length;
    this.numColumns = this._values[0].length;

    if (this.numRows == 1) {
      this._entryRange = null;
      this._entries = [];
      this._ids = [];
    } else if (this.numRows > 1) {
      this._entryRange = this._sheet.getRange(
        2,
        1,
        this.numRows - 1,
        this.numColumns
      );
      this._entries = this._values.slice(1, -1);

      this._ids = this._entries
        .map((entry) => {
          if (typeof entry[0] !== "number")
            throw `All IDs must be numbers, ${entry[0]} is not a number`;
          return entry[0];
        })
        .flat();
    } else throw "0 rows? Headers must be present";
  }

  protected _update = () => {
    SpreadsheetApp.flush();
    // Utilities.sleep(1000)
    this._loadData();
  };

  protected _getIdRowNumber(this: Table, searchId: number): number {
    for (const [index, id] of this._ids.entries()) {
      if (id === searchId) {
        // index + 1 because rows begin at 1 not 0
        const rowNumber = index + 1;
        return rowNumber;
      }
    }
  }
  protected _addIndicesToFilterObject =
    TableGetMethods.addIndicesToFilterObject;

  public getColumnByHeader = TableGetMethods.getColumnByHeader;
  public getRowById = TableGetMethods.getRowById;
  public getRowsByFilter = TableGetMethods.getRowsByFilter;

  public getEntries = TableEntryMethods.getEntries;
  public addEntry = TableEntryMethods.addEntry;

  public createUniqueKeys = TableUpdateMethods.createUniqueKeys;
  public addRow = TableUpdateMethods.addRow;
  public updateValue = TableUpdateMethods.updateValue;
  public updateRow = TableUpdateMethods.updateRow;
  public deleteRow = TableUpdateMethods.deleteRow;
}
