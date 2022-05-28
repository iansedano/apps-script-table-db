/*

The design of this class must take into account the fact that the
table will be reinitialized at every execution. Hence loading ids, headers,
values are all done depending on the task at hand.

*/

type RowResult = {
  rowNumber: number;
  row: Array<any>;
};

type ColumnResult = {
  columnNumber: number;
  column: Array<any>;
};

type Filter = {}; // key is header and value is value to filter
type OrderedFilterObject = { headers: string[]; values: any[] };
type Entry = { id?: number };

interface TableInterface {
  getIds(): Array<number>;
  getHeaders(): Array<string>;

  getEntries(filterObject: Filter): Array<Entry>; // empty obj returns everything

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
    this._loadData();
    this._entryRange.clear();
  }

  protected _update = () => {
    SpreadsheetApp.flush();
    // Utilities.sleep(1000)
    this._loadData();
  };

  protected _getRowNumber = TableInternalMethods._getRowNumber;
  protected _loadData = TableInternalMethods._loadData;

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
