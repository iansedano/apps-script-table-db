interface TableInterface {
  /**
   * General purpose method to get entries as specified by a `filter` object.
   * The `filter` argument is optional
   * @param {RawFilter} [filter] Object with keys as headers and values the value to filter.
   * @returns list of {@link Entry} objects
   */
  getEntries(filter?: Object): Entry[];
  addEntries(entries: Entry[]): void;

  /**
   * @param entry Object with `id` key that exists in the table.
   * Will overwrite existing entry with any keys that are headers.
   * Keys that don't have a corresponding header in the table will throw an error.
   */
  updateEntry(entry: Entry): void;
  deleteEntry(idToDelete: number): void;
  clearAllEntries(): void;
}

/**
 * Base class for `table-db` library
 */
class Table implements TableInterface {
  protected sheet: GoogleAppsScript.Spreadsheet.Sheet;
  /** Range of all data in sheet _inlcuding_ headers. */
  protected dataRange: GoogleAppsScript.Spreadsheet.Range;
  /** Range of all data in sheet _excluding_ headers */
  protected entryRange: GoogleAppsScript.Spreadsheet.Range;
  protected ids: number[];
  protected headers: string[];
  /** A two dimensional array of all values in the sheet _excluding_ headers */
  protected entryArray: any[][];
  /** Total number of rows including headers */
  protected numRows: number;
  protected numColumns: number;
  protected keysCreated: number[];
  protected allValues: any[][];

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.sheet = sheet;
    this.reset();
  }

  public clearAllEntries(): void {
    this.reset(); // Probably not needed but might be good to have as failsafe
    this.entryRange.clear();
  }

  protected reset(): void {
    // Get all values from spreadsheet
    this.dataRange = this.sheet.getDataRange();
    this.allValues = this.dataRange.getValues();

    // Assign values to object properties
    this.headers = this.allValues[0];
    if (this.headers[0] !== "id") throw "first column must be 'id' lowercase";
    this.numRows = this.allValues.length; // Includes headers
    this.numColumns = this.allValues[0].length;

    if (this.numRows < 1) throw "0 rows? Headers must be present";

    // If sheet only has headers
    if (this.numRows == 1) {
      this.entryRange = null;
      this.entryArray = [];
      this.ids = [];
      return;
    }

    this.entryRange = this.sheet.getRange(
      2,
      1,
      this.numRows - 1,
      this.numColumns
    );
    this.entryArray = this.allValues.slice(1);

    this.ids = this.entryArray
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
    this.reset();
  };

  protected getIdRowNumber(searchId: number): number {
    // index + 2 because rows begin at 1 not 0, and header row not included in ids
    return this.ids.findIndex((id) => id == searchId) + 2;
  }

  protected getRows(filter: Filter): Frame {
    const rowResults: Frame = filter.filter(this.entryArray);
    if (rowResults.length === 0) console.log("no results");
    return rowResults;
  }

  public getEntries(filter: Object = null): Entry[] {
    const rowResults = this.getRows(new Filter(filter, this.headers));
    if (rowResults.length === 0) return [];
    if (rowResults[0][0] == "id") throw "header values are being returned";

    return rowResults.map((row) => rowToEntry(row, this.headers));
  }

  /**
   *
   * @param entries array of entries _without_ id (they are created automatically)
   *
   */
  public addEntries(entries: Entry[]): void {
    this.addRows(entries.map((entry) => entryToRow(entry, this.headers)));
    this.update();
  }

  /**
   *
   * @param headerName
   * @returns `Series` representing one column
   */
  protected getColumnByHeader(headerName: string): Series {
    if (!this.headers.includes(headerName)) throw "No such header";

    const columnIndex: number = this.headers.indexOf(headerName);
    return this.entryArray.map((entry) => entry[columnIndex]).flat();
  }

  /**
   *
   * @param searchId
   * @returns `Series` representing one row
   */
  protected getRowById(searchId: number): Series {
    return this.entryArray.find((entry) => entry[0] == searchId);
  }

  /**
   * Add rows to the spreadsheet. First column must be falsy values because
   * they will be replaced with the newly generated IDs.
   *
   * @param rows 2D array with _same number of columns_ as headers
   * @returns Array of new ids
   */
  protected addRows(rows: Frame): number[] {
    if (rows[0].length !== this.numColumns)
      throw "rows to insert must have same length as headers";
    const ids = this.createUniqueKeys(rows.length);
    console.log(ids);
    this.sheet
      .getRange(this.numRows + 1, 1, rows.length, this.numColumns)
      .setValues(
        rows.map((row, i) => {
          row[0] = ids[i];
          return row;
        })
      );
    this.update();
    return ids;
  }

  protected createUniqueKeys(numberOfKeys: number): number[] {
    if (this.ids.length == 0)
      return Array(numberOfKeys)
        .fill(0)
        .map((_, i) => i + 1);

    const sortedIds = this.ids.sort((idA, idB) => idA - idB);

    const newKeys = [];
    for (let i = 0; i != numberOfKeys; i++) {
      newKeys.push(sortedIds[sortedIds.length - 1] + 1 + i);
    }

    return newKeys;
  }

  public updateEntry(entry: Entry): void {
    if (!this.ids.includes(entry.id)) throw "ID doesn't exist in table";
    const existingEntry = this.getEntries({ id: entry.id });
    const combinedRow = this.headers.reduce(
      (acc: Series, header: string): Series => {
        acc.push(entry[header] || existingEntry[header]);
        return acc;
      },
      []
    );
    this.sheet
      .getRange(this.getIdRowNumber(entry.id), 1, 1, this.numColumns)
      .setValues([combinedRow]);
    this.update();
  }

  public deleteEntry(idToDelete: number): void {
    const rowNumber: number = this.getIdRowNumber(idToDelete);
    this.sheet.deleteRow(rowNumber);
    this.update();
  }
}
