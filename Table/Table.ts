// TODO - remove
type RowResult = {
  rowNumber: number;
  row: Array<any>;
};

/**
 * Object representing a row, with each key is a header name, and the value
 * is the row value
 */
type Entry = { id?: number };

/**
 * Object where key represents header and the value is the filter value
 * for that header.
 */
type Filter = { [key: string]: any };

/**
 * Extension of the {@link Filter} type that includes the column index of the header name
 */
type IndexedFilter = { [key: string]: { headerColIndex: number; value: any } };

interface TableInterface {
  getEntries(filterObject: Object): Array<Entry>; // empty obj returns everything
  addEntry(entry: Entry): void;
  updateValue(idToUpdate: number, headerName: string, value: any): number;
  createUniqueKeys(numberOfKeys: number): Array<number>;

  clearEntries(): void;

  // checkUniqueKeys();
  // ensureSortedById();
  // checkLimits();
}

/**
 * Base class for table-db library
 */
class Table implements TableInterface {
  protected sheet: GoogleAppsScript.Spreadsheet.Sheet;
  protected dataRange: GoogleAppsScript.Spreadsheet.Range; // All data including headers
  protected entryRange: GoogleAppsScript.Spreadsheet.Range; // All data excluding headers
  protected ids: number[];
  protected headers: string[];
  protected entries: any[][];
  protected numRows: number;
  protected numColumns: number;
  protected keysCreated: number[];
  protected allValues: any[][];
  protected entryValues: any[][];

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.sheet = sheet;
    this.load();
  }

  public clearEntries(): void {
    this.load(); // Probably not needed but might be good to have as failsafe
    this.entryRange.clear();
  }

  protected load(this: Table): void {
    // Get all values from spreadsheet
    this.dataRange = this.sheet.getDataRange();
    this.allValues = this.dataRange.getValues();

    // Assign values to object properties
    this.headers = this.allValues[0];
    if (this.headers[0] !== "id") throw "first column must be 'id' lowercase";
    this.numRows = this.allValues.length;
    this.numColumns = this.allValues[0].length;

    if (this.numRows < 1) throw "0 rows? Headers must be present";

    if (this.numRows == 1) {
      this.entryRange = null;
      this.entries = [];
      this.ids = [];
      return;
    }

    this.entryRange = this.sheet.getRange(
      2,
      1,
      this.numRows - 1,
      this.numColumns
    );
    this.entries = this.allValues.slice(1, -1);

    this.ids = this.entries
      .map((entry) => {
        if (typeof entry[0] !== "number")
          throw `All IDs must be numbers, ${entry[0]} is not a number`;
        return entry[0];
      })
      .flat();
  }

  protected update = () => {
    SpreadsheetApp.flush();
    // Utilities.sleep(1000)
    this.load();
  };

  protected getIdRowNumber(searchId: number): number {
    // index + 2 because rows begin at 1 not 0, and header row not included in ids
    return this.ids.findIndex((id) => id == searchId) + 2;
  }

  protected convertFilterToIndexed(this: Table, filter: Filter): IndexedFilter {
    return Object.entries(filter).reduce(
      (acc: IndexedFilter, [header, value]: [string, any]): IndexedFilter => {
        if (!this.headers.includes(header)) throw `"${header}" not found`;
        acc[header] = {
          headerColIndex: this.headers.indexOf(header),
          value: value,
        };
        return acc;
      },
      {}
    );
  }

  protected getRows(filterObject: Filter): any[][] {
    const filter = this.convertFilterToIndexed(filterObject);

    const rowResults: any[][] = this.entries.reduce(
      (output: any[], row: any[]): any[] => {
        if (
          Object.entries(filter).every(
            ([_, { headerColIndex, value }]): boolean => {
              if (row[headerColIndex] == value) return true;
              return false;
            }
          )
        ) {
          output.push(row);
        }
        return output;
      },
      []
    );

    if (rowResults.length === 0) console.log("no results");

    return rowResults;
  }

  public getEntries(filter: Object = null): Entry[] {
    const rowResults = this.getRows(filter || {});
    if (rowResults.length === 0) return [];
    if (rowResults[0][0] == "id") throw "header values are being returned";

    return rowResults.map((row): Entry => {
      return row.reduce((output: Entry, value: any, index: number): Entry => {
        const header = this.headers[index];
        output[header] = value;
        return output;
      }, {});
    });
  }

  public addEntry(entry: Entry): void {
    const row = this.headers.map((header) => entry[header]);
    this.addRow(row);
    this.update();
  }

  protected getColumnByHeader(headerName: string): any[] {
    if (!this.headers.includes(headerName)) throw "No such header";

    const columnIndex: number = this.headers.indexOf(headerName);
    return this.entries.map((entry) => entry[columnIndex]).flat();
  }

  protected getRowById(searchId: number): any[] {
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

  public createUniqueKeys = TableUpdateMethods.createUniqueKeys;
  public addRow = TableUpdateMethods.addRow;
  public updateValue = TableUpdateMethods.updateValue;
  public updateRow = TableUpdateMethods.updateRow;
  public deleteRow = TableUpdateMethods.deleteRow;
}
