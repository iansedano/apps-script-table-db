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

  export function getRowsByValue(
    this: Table,
    headerName: string,
    query: any
  ): Array<RowResult> {
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
}
