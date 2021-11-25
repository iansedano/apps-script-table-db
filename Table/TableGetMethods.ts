namespace TableGetMethods {
  export function getColumnByHeader(
    this: Table,
    headerName: string
  ): ColumnResult {
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

  export function getRowById(this: Table, searchId: number): RowResult {
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

  type OrderedFilterObject = { headers: string[]; values: any[] };

  export function getRowsByFilter(
    this: Table,
    filterObject: Filter
  ): Array<RowResult> {
    if (!this.ids) this._loadIds();
    if (!this.headers) this._loadHeaders();

    if (!this._dataRange) this._loadDataRange();

    // is this necessary? Limit of number of cells??

    let columns: Array<ColumnResult> = [];
    // TODO - what if someone wants to get certain range of ids...
    let filter: OrderedFilterObject = { headers: ["id"], values: [null] }; // null can mean "any"
    for (const header in filterObject) {
      if (!this.headers.includes(header)) throw `"${header}" not found`;
      filter.headers.push(header);
      filter.values.push(filterObject[header]);
      columns.push(this.getColumnByHeader(header));
    }

    const valuesToFilter = this.ids.map((id: number, index: number) => {
      return [
        id,
        ...columns.map(
          (columnResult: ColumnResult) => columnResult.column[index]
        )
      ];
    });

    // https://developers.google.com/apps-script/reference/spreadsheet/sheet#getrangelista1notations

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
          const header = filter.headers[index];
          const filterValue = filter.values[index];

          if (rowValue != filterValue && filterValue != null) {
            return output;
          }
        }
        // If here, means that filter matches.
        const rowNumber = index + 1;
        output.push({
          rowNumber,
          row: this._sheet
            .getRange(rowNumber, 1, 1, this.numColumns)
            .getValues()[0]
        });
        return output;
      },
      []
    );

    if (rowResults.length === 0) return undefined;

    return rowResults;
  }
}
