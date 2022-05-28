namespace TableGetMethods {
  export function getColumnByHeader(
    this: Table,
    headerName: string
  ): ColumnResult {
    if (!this._headers.includes(headerName)) return undefined;
    if (!this._dataRange) this._loadData();

    const columnNumber: number = this._headers.indexOf(headerName) + 1;

    return {
      columnNumber,
      column: this._sheet
        .getRange(2, columnNumber, this.numRows, 1)
        .getValues()
        .flat(),
    };
  }

  export function getRowById(this: Table, searchId: number): RowResult {
    for (const [index, id] of this._ids.entries()) {
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

  export function getRowsByFilter(
    this: Table,
    filterObject: Filter
  ): Array<RowResult> {
    // TODO - what if someone wants to get certain range of ids...
    // TODO - Limit of number of cells??

    // Initializing columns to be searched, array of columns with all values in column
    let columnResults: Array<ColumnResult> = [];
    // Initializing transformation of the filterObject into arrays to be iterated over
    let filter: OrderedFilterObject = { headers: ["id"], values: [null] }; // null can mean "any"

    // For each header
    // Could be optimized by getting adjacent columns in one call
    for (const header in filterObject) {
      if (!this._headers.includes(header)) throw `"${header}" not found`;
      filter.headers.push(header);
      filter.values.push(filterObject[header]);
      columnResults.push(this.getColumnByHeader(header));
    }

    // Creating intermediate value array with ids and the values that are being filtered
    const valuesToFilter = this._ids.map((id: number, index: number) => {
      return [
        id,
        ...columnResults.map(
          (columnResult: ColumnResult) => columnResult.column[index]
        ),
      ];
    });

    // https://developers.google.com/apps-script/reference/spreadsheet/sheet#getrangelista1notations

    // Using intermediate array, valuesToFilter to return an array of RowResults
    // TODO - this gets each row individually from sheet, doesn't filter in memory
    const rowResults: Array<RowResult> = valuesToFilter.reduce(
      (
        output: Array<RowResult>,
        row: Array<any>,
        index: number,
        array: any
      ): Array<RowResult> => {
        // Going through filter object to see if match
        // returns unmodified output if not.
        for (const [index, rowValue] of row.entries()) {
          const filterValue = filter.values[index];

          if (rowValue != filterValue && filterValue != null) {
            return output;
          }
        }
        // If here, means that filter matches.
        const rowNumber = index + 2;
        output.push({
          rowNumber,
          row: this._sheet
            .getRange(rowNumber, 1, 1, this.numColumns)
            .getValues()[0],
        });
        return output;
      },
      []
    );

    if (rowResults.length === 0) console.log("no results");

    return rowResults;
  }
}
